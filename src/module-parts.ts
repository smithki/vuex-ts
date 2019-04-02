// --- Imports -------------------------------------------------------------- //

// Vendor
import { ActionContext } from 'vuex';

// Internal
import { ModuleNotBoundToStoreError } from './exceptions';
import { getStore, moduleIsBound } from './lib';
import * as Symbols from './symbols';
import * as Types from './types';
import { VuexTsModule, vuexTsModuleBuilder, VuexTsModuleInstance, VuexTsModuleInstanceProxy } from './vuex-ts-module';

// --- Base module part ----------------------------------------------------- //

export abstract class ModulePart {
  protected [Symbols.vuexTsModuleInstance]: VuexTsModuleInstance<any>;
  public abstract [Symbols.usedIn]: () => Types.ConstructorOf<VuexTsModule>;

  constructor(vuexTsModuleInstance: VuexTsModuleInstance<any>) {
    this[Symbols.vuexTsModuleInstance] = vuexTsModuleInstance;
  }
}

function filterReservedKeysPredicate(name: string) {
  const reservedKeys = ['constructor', 'usedIn', 'context', 'state', 'rootState', 'module'];
  return !reservedKeys.includes(name);
}

// --- Getters -------------------------------------------------------------- //

export abstract class ModuleGetters extends ModulePart {
  constructor(vuexTsModuleInstance: VuexTsModuleInstance<any>) {
    super(vuexTsModuleInstance);

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(vuexTsModuleInstance)) {
            throw new ModuleNotBoundToStoreError(vuexTsModuleInstance.name, 'getters');
          }

          if (vuexTsModuleInstance[Symbols.isRoot]) return getStore(vuexTsModuleInstance).getters[prop];
          return getStore(vuexTsModuleInstance).getters[`${vuexTsModuleInstance.namespaceKey}/${prop}`];
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get [Symbols.staticGetters]() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(filterReservedKeysPredicate);
    const result: Types.StaticGetters = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);
      const isComputedGetter = Boolean(Object.getOwnPropertyDescriptor(proto, name)!.get);

      result[name] = (vuexState, vuexGetters, vuexRootState) => {
        const getContext = new Proxy(unwrappedProxy, {
          get: (target, prop, receiver) => {
            if (prop === Symbols.state) return vuexState;
            if (prop === Symbols.rootState) return vuexRootState;
            if (prop === Symbols.module) return this[Symbols.vuexTsModuleInstance];

            // Unwrap the proxy and return the getter value.
            return Reflect.get(target, prop, receiver);
          },
        });

        return isComputedGetter ? (getContext as any)[name] : (getContext as any)[name].bind(getContext);
      };
    }

    return result;
  }

  public [Symbols.state]: Types.InferModuleState<this> & Types.InferChildState<this>;
  public [Symbols.rootState]: Types.InferRootState<this>;
  public [Symbols.module]: VuexTsModuleInstanceProxy<Types.InferVuexTsModule<this>> &
    Types.InferChildModuleProxies<this>;
}

// --- Mutations ------------------------------------------------------------ //

export abstract class ModuleMutations extends ModulePart {
  constructor(vuexTsModuleInstance: VuexTsModuleInstance<any>) {
    super(vuexTsModuleInstance);

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(vuexTsModuleInstance)) {
            throw new ModuleNotBoundToStoreError(vuexTsModuleInstance.name, 'commit');
          }

          return (payload: any) => {
            if (vuexTsModuleInstance[Symbols.isRoot]) {
              getStore(vuexTsModuleInstance).commit(prop as string, payload, { root: true }) as any;
            } else {
              getStore(vuexTsModuleInstance).commit(`${vuexTsModuleInstance.namespaceKey}/${prop}`, payload, {
                root: true,
              }) as any;
            }
          };
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get [Symbols.staticMutations]() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(filterReservedKeysPredicate);
    const result: Types.StaticMutations = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);

      result[name] = (vuexState, payload) => {
        const mutContext = new Proxy(unwrappedProxy, {
          get: (target, prop, receiver) => {
            if (prop === Symbols.state) return vuexState;
            if (prop === Symbols.module) return this[Symbols.vuexTsModuleInstance];

            return Reflect.get(target, prop, receiver);
          },
        });

        (mutContext as any)[name](payload);
      };
    }

    return result;
  }

  public [Symbols.state]: Types.InferModuleState<this> & Types.InferChildState<this>;
  public [Symbols.module]: VuexTsModuleInstanceProxy<Types.InferVuexTsModule<this>> &
    Types.InferChildModuleProxies<this>;

  [key: string]: (payload?: any) => void;
}

// --- Actions -------------------------------------------------------------- //

export abstract class ModuleActions extends ModulePart {
  constructor(vuexTsModuleInstance: VuexTsModuleInstance<any>) {
    super(vuexTsModuleInstance);

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(vuexTsModuleInstance)) {
            throw new ModuleNotBoundToStoreError(vuexTsModuleInstance.name, 'dispatch');
          }

          return (payload: any) => {
            if (vuexTsModuleInstance[Symbols.isRoot]) {
              return getStore(vuexTsModuleInstance).dispatch(prop as any, payload, {
                root: true,
              }) as any;
            }

            return getStore(vuexTsModuleInstance).dispatch(`${vuexTsModuleInstance.namespaceKey}/${prop}`, payload, {
              root: true,
            }) as any;
          };
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get [Symbols.staticActions]() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(filterReservedKeysPredicate);
    const result: Types.StaticActions = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);

      result[name] = async (vuexContext, payload) => {
        const actContext = new Proxy(unwrappedProxy, {
          get: (target, prop, reciever) => {
            if (prop === Symbols.context) return vuexContext;
            if (prop === Symbols.state) return vuexContext.state;
            if (prop === Symbols.rootState) return vuexContext.rootState;
            if (prop === Symbols.module) return this[Symbols.vuexTsModuleInstance];

            return Reflect.get(target, prop, reciever);
          },
        });

        return (actContext as any)[name](payload);
      };
    }

    return result;
  }

  public [Symbols.state]: Types.InferModuleState<this> & Types.InferChildState<this>;
  public [Symbols.rootState]: Types.InferRootState<this>;
  public [Symbols.context]: ActionContext<Types.InferModuleState<this>, Types.InferRootState<this>>;
  public [Symbols.module]: VuexTsModuleInstanceProxy<Types.InferVuexTsModule<this>> &
    Types.InferChildModuleProxies<this>;

  [key: string]: (payload?: any) => Promise<any>;
}

// --- Child modules -------------------------------------------------------- //

export abstract class ModuleChildren extends ModulePart {
  get [Symbols.children]() {
    const moduleNames = [
      ...Object.getOwnPropertyNames(this).filter(filterReservedKeysPredicate),
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(filterReservedKeysPredicate),
    ];

    const result: {
      staticChildren: Types.StaticChildren;
      vuexTsModuleInstances: { [key: string]: VuexTsModuleInstance<any> };
    } = {
      staticChildren: {},
      vuexTsModuleInstances: {},
    };

    for (const name of moduleNames) {
      result.vuexTsModuleInstances[name] = vuexTsModuleBuilder(this[name]()).clone(name);
      result.staticChildren[name] = result.vuexTsModuleInstances[name][Symbols.vuexModule];
    }

    return result;
  }

  [key: string]: () => Types.ConstructorOf<VuexTsModule>;
}
