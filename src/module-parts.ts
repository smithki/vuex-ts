import { ActionContext } from 'vuex';
import { VuexTsModule } from '.';
import { ModuleNotBoundToStoreError } from './exceptions';
import { getStore, moduleIsBound } from './lib';
import {
  context,
  isRoot,
  rootState,
  state,
  staticActions,
  staticChildren,
  staticGetters,
  staticMutations,
  vuexModule,
} from './symbols';
import {
  ChildState,
  CompositeVuexTsModule,
  InferChildren,
  InferModuleState,
  StaticActions,
  StaticChildren,
  StaticGetters,
  StaticMutations,
} from './types';

// --- Getters -------------------------------------------------------------- //

export abstract class ModuleGetters {
  constructor(parentModule: VuexTsModule) {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(parentModule)) {
            throw new ModuleNotBoundToStoreError(parentModule.name, 'getters');
          }

          if (parentModule[isRoot]) return getStore(parentModule).getters[prop];
          return getStore(parentModule).getters[`${parentModule.namespaceKey}/${prop}`];
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get [staticGetters]() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor');
    const result: StaticGetters = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);
      const isComputedGetter = Boolean(Object.getOwnPropertyDescriptor(proto, name)!.get);

      result[name] = (vuexState, vuexGetters, vuexRootState) => {
        const getContext = new Proxy(unwrappedProxy, {
          get: (target, prop, receiver) => {
            if (prop === state) return vuexState;
            if (prop === rootState) return vuexRootState;

            // Unwrap the proxy and return the getter value.
            return Reflect.get(target, prop, receiver);
          },
        });

        return isComputedGetter ? (getContext as any)[name] : (getContext as any)[name].bind(getContext);
      };
    }

    return result;
  }

  // state: InferModuleState<T> & ChildState<InferChildren<T>>;
  // [rootState]: RootState;
}

// --- Mutations ------------------------------------------------------------ //

export abstract class ModuleMutations<ModuleState = any> {
  constructor(parentModule: VuexTsModule) {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(parentModule)) {
            throw new ModuleNotBoundToStoreError(parentModule.name, 'commit');
          }

          return (payload: any) => {
            if (parentModule[isRoot]) getStore(parentModule).commit(prop as string, payload, { root: true }) as any;
            else getStore(parentModule).commit(`${parentModule.namespaceKey}/${prop}`, payload, { root: true }) as any;
          };
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get [staticMutations]() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor');
    const result: StaticMutations = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);

      result[name] = (vuexState, payload) => {
        const mutContext = new Proxy(unwrappedProxy, {
          get: (target, prop, receiver) => {
            if (prop === state) return vuexState;

            return Reflect.get(target, prop, receiver);
          },
        });

        (mutContext as any)[name](payload);
      };
    }

    return result;
  }

  [state]: ModuleState;
  [key: string]: (payload?: any) => void;
}

// --- Actions -------------------------------------------------------------- //

export abstract class ModuleActions<ModuleState = any, RootState = any> {
  constructor(parentModule: VuexTsModule) {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(parentModule)) {
            throw new ModuleNotBoundToStoreError(parentModule.name, 'dispatch');
          }

          return (payload: any) => {
            if (parentModule[isRoot]) {
              return getStore(parentModule).dispatch(prop as any, payload, {
                root: true,
              }) as any;
            }

            return getStore(parentModule).dispatch(`${parentModule.namespaceKey}/${prop}`, payload, {
              root: true,
            }) as any;
          };
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get [staticActions]() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor');
    const result: StaticActions = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);

      result[name] = async (vuexContext, payload) => {
        const actContext = new Proxy(unwrappedProxy, {
          get: (target, prop, reciever) => {
            if (prop === context) return vuexContext;
            if (prop === state) return vuexContext.state;
            if (prop === rootState) return vuexContext.rootState;
            return Reflect.get(target, prop, reciever);
          },
        });

        return (actContext as any)[name](payload);
      };
    }

    return result;
  }

  [state]: ModuleState;
  [rootState]: RootState;
  [context]: ActionContext<ModuleState, RootState>;
  [key: string]: (payload?: any) => Promise<any>;
}

// --- Nested modules ------------------------------------------------------- //

export abstract class ModuleChildren {
  get [staticChildren]() {
    const moduleNames = [
      ...Object.getOwnPropertyNames(this),
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor'),
    ];
    const result: StaticChildren = {};

    for (const name of moduleNames) {
      this[name] = (this[name] as any)().clone(name);
      result[name] = (this[name] as any)[vuexModule];
    }

    return result;
  }

  [key: string]: () => CompositeVuexTsModule;

  // Disallow reserved keys
  name: never;
  getters: never;
  commit: never;
  dispatch: never;
  clone: never;
  state: never;
  namespaceKey: never;
  register: never;
  unregister: never;
  toStore: never;
}
