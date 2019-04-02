// --- Imports -------------------------------------------------------------- //

import { ActionContext } from 'vuex';
import { getStore, moduleIsBound } from './lib';
import * as Symbols from './symbols';
import * as Types from './types/utility-types';
import { VuexTsModule, VuexTsModuleBuilderProxy, VuexTsModuleInstance } from './vuex-ts-module';

// --- Base module part ----------------------------------------------------- //

export abstract class ModulePart {
  protected [Symbols.vuexTsModuleInstance]: VuexTsModuleInstance<any>;
  public abstract usedIn: () => Types.ConstructorOf<VuexTsModule>;

  constructor(vuexTsModuleInstance: VuexTsModuleInstance<any>) {
    this[Symbols.vuexTsModuleInstance] = vuexTsModuleInstance;
  }
}

// --- Getters -------------------------------------------------------------- //

export abstract class ModuleGetters extends ModulePart {
  constructor(vuexTsModuleInstance: VuexTsModuleInstance<any>) {
    super(vuexTsModuleInstance);

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(vuexTsModuleInstance)) {
            // throw new ModuleNotBoundToStoreError(builder.name, 'getters');
          }

          if (vuexTsModuleInstance[Symbols.isRoot]) return getStore(vuexTsModuleInstance).getters[prop];
          return getStore(vuexTsModuleInstance).getters[`${vuexTsModuleInstance.namespaceKey}/${prop}`];
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get [Symbols.staticGetters]() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor');
    const result: Types.StaticGetters = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);
      const isComputedGetter = Boolean(Object.getOwnPropertyDescriptor(proto, name)!.get);

      result[name] = (vuexState, vuexGetters, vuexRootState) => {
        const getContext = new Proxy(unwrappedProxy, {
          get: (target, prop, receiver) => {
            if (prop === 'state') return vuexState;
            if (prop === 'rootState') return vuexRootState;
            if (prop === 'parent') return this[Symbols.vuexTsModuleInstance];

            // Unwrap the proxy and return the getter value.
            return Reflect.get(target, prop, receiver);
          },
        });

        return isComputedGetter ? (getContext as any)[name] : (getContext as any)[name].bind(getContext);
      };
    }

    return result;
  }

  public state: Types.InferModuleState<this> & Types.InferChildState<this>;
  public rootState: Types.InferRootState<this>;
  public module: VuexTsModuleBuilderProxy<Types.InferVuexTsModule<this>> & Types.InferChildModuleProxies<this>;
}

// --- Mutations ------------------------------------------------------------ //

export abstract class ModuleMutations extends ModulePart {
  constructor(vuexTsModuleInstance: VuexTsModuleInstance<any>) {
    super(vuexTsModuleInstance);

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(vuexTsModuleInstance)) {
            // throw new ModuleNotBoundToStoreError(builder.name, 'commit');
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
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor');
    const result: Types.StaticMutations = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);

      result[name] = (vuexState, payload) => {
        const mutContext = new Proxy(unwrappedProxy, {
          get: (target, prop, receiver) => {
            if (prop === 'state') return vuexState;

            return Reflect.get(target, prop, receiver);
          },
        });

        (mutContext as any)[name](payload);
      };
    }

    return result;
  }

  public state: Types.InferModuleState<this> & Types.InferChildState<this>;
  // @ts-ignore -- Ignoring this because we know the index signature does not match and we don't care.
  public parent: VuexTsModuleBuilderProxy<Types.InferVuexTsModule<this>> & Types.InferChildModuleProxies<this>;
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
            // throw new ModuleNotBoundToStoreError(builder.name, 'dispatch');
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
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor');
    const result: Types.StaticActions = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);

      result[name] = async (vuexContext, payload) => {
        const actContext = new Proxy(unwrappedProxy, {
          get: (target, prop, reciever) => {
            if (prop === 'context') return vuexContext;
            if (prop === 'state') return vuexContext.state;
            if (prop === 'rootState') return vuexContext.rootState;
            return Reflect.get(target, prop, reciever);
          },
        });

        return (actContext as any)[name](payload);
      };
    }

    return result;
  }

  public state: Types.InferModuleState<this> & Types.InferChildState<this>;
  public rootState: Types.InferRootState<this>;
  // @ts-ignore -- Ignoring this because we know the index signature does not match and we don't care.
  public context: ActionContext<Types.InferModuleState<this>, Types.InferRootState<this>>;
  // @ts-ignore -- Ignoring this because we know the index signature does not match and we don't care.
  public parent: VuexTsModuleBuilderProxy<Types.InferVuexTsModule<this>> & Types.InferChildModuleProxies<this>;
  // @ts-ignore -- Ignoring this because we know the index signature does not match and we don't care.
  [key: string]: (payload?: any) => Promise<any>;
}

// --- Child modules -------------------------------------------------------- //

export abstract class ModuleChildren extends ModulePart {
  [key: string]: () => Types.ConstructorOf<VuexTsModule>;
}
