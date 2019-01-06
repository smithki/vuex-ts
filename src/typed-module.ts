import { ActionContext, Module, Store } from 'vuex';
import { bindModuleToStore, getStore, moduleIsBound, qualifyNamespace, unbindModuleFromStore } from './lib';
import { context, rootState, state } from './symbols';
import {
  CommitFunc,
  ConstructorOf,
  DispatchFunc,
  MappedActions,
  MappedGetters,
  MappedMutations,
  StaticActions,
  StaticGetters,
  StaticMutations,
} from './types';

// --- Getters -------------------------------------------------------------- //

export abstract class ModuleGetters<ModuleState, RootState> {
  [state]: ModuleState;
  [rootState]: RootState;
}

// --- Mutations ------------------------------------------------------------ //

export abstract class ModuleMutations<ModuleState> {
  [state]: ModuleState;
  [key: string]: (payload?: any) => void;
}

// --- Actions -------------------------------------------------------------- //

export abstract class ModuleActions<ModuleState, RootState> {
  [state]: ModuleState;
  [rootState]: RootState;
  [context]: ActionContext<ModuleState, RootState>;
  [key: string]: (payload?: any) => Promise<any>;
}

// --- Module --------------------------------------------------------------- //

export class VuexTsModule<
  ModuleState,
  RootState,
  Getters extends ModuleGetters<ModuleState, RootState>,
  Mutations extends ModuleMutations<ModuleState>,
  Actions extends ModuleActions<ModuleState, RootState>
> {
  readonly id: symbol;
  readonly name: string;
  readonly modules: VuexTsModule<any, RootState, any, any, any>[];
  readonly getters: MappedGetters<Getters>;
  readonly staticGetters: StaticGetters;
  readonly staticMutations: StaticMutations;
  readonly mappedMutations: MappedMutations<Mutations>;
  readonly staticActions: StaticActions;
  readonly mappedActions: MappedActions<Actions>;
  readonly initialState: ModuleState | undefined;
  readonly commit: CommitFunc<Mutations> & MappedMutations<Mutations>;
  readonly dispatch: DispatchFunc<Actions> & MappedActions<Actions>;

  constructor({
    name: moduleName,
    state: moduleState,
    getters,
    mutations,
    actions,
    modules,
  }: {
    name: string;
    state?: ModuleState;
    getters?: ConstructorOf<Getters>;
    mutations?: ConstructorOf<Mutations>;
    actions?: ConstructorOf<Actions>;
    modules?: VuexTsModule<any, RootState, any, any, any>[];
  }) {
    // --- Initialize instance properties --- //

    this.name = moduleName;
    this.id = Symbol(this.name);
    this.modules = modules || [];
    this.getters = {} as any;
    this.staticGetters = {};
    this.mappedMutations = {} as any;
    this.staticMutations = {};
    this.mappedActions = {} as any;
    this.staticActions = {};
    if (moduleState) this.initialState = moduleState;

    // --- Build strongly-typed getters --- //

    if (getters) {
      const getInst = new getters();
      const getNames = Object.getOwnPropertyNames(Object.getPrototypeOf(getInst)).filter(
        name => name !== 'constructor',
      );

      for (const name of getNames) {
        const isComputedGetter = Boolean(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(getInst), name)!.get);

        this.staticGetters[name] = (vuexState, vuexRootState) => {
          const getContext = new Proxy(getInst, {
            get: (target, prop, reciever) => {
              if (prop === state) return vuexState;
              if (prop === rootState) return vuexRootState;
              return Reflect.get(target, prop, reciever);
            },
          });

          return isComputedGetter ? (getContext as any)[name] : (getContext as any)[name].bind(getContext);
        };

        Object.defineProperty(this.getters, name, {
          get: () => getStore(this).getters[`${this.namespacedKey}/${name}`],
        });
      }
    }

    // --- Build strongly-typed mutations --- //

    if (mutations) {
      const mutInst = new mutations();
      const mutNames = Object.getOwnPropertyNames(Object.getPrototypeOf(mutInst)).filter(
        name => name !== 'constructor',
      );

      for (const name of mutNames) {
        this.staticMutations[name] = (vuexState, payload) => {
          const mutContext = new Proxy(mutInst, {
            get: (target, prop, reciever) => {
              if (prop === state) return vuexState;
              return Reflect.get(target, prop, reciever);
            },
          });

          (mutContext as any)[name](payload);
        };

        (this.mappedMutations as any)[name] = (payload: any) => {
          getStore(this).commit(`${this.namespacedKey}/${name}`, payload, { root: true }) as any;
        };
      }
    }

    // --- Build strongly-typed actions --- //

    if (actions) {
      const actInst = new actions();
      const actNames = Object.getOwnPropertyNames(Object.getPrototypeOf(actInst)).filter(
        name => name !== 'constructor',
      );

      for (const name of actNames) {
        this.staticActions[name] = async (vuexContext, payload) => {
          const actContext = new Proxy(actInst, {
            get: (target, prop, reciever) => {
              if (prop === context) return vuexContext;
              if (prop === state) return vuexContext.state;
              if (prop === rootState) return vuexContext.rootState;
              return Reflect.get(target, prop, reciever);
            },
          });

          (actContext as any)[name](payload);
        };

        (this.mappedActions as any)[name] = (payload: any) => {
          getStore(this).dispatch(`${this.namespacedKey}/${name}`, payload, { root: true }) as any;
        };
      }
    }

    // --- Build commit/dispatch methods --- //
    // We combine these methods with a tree of mapped mutations/actions to
    // provide an optional, more TypeScript-friendly interface.

    const commitFunc: CommitFunc<Mutations> = (mutationName, ...payload) => {
      (this.mappedMutations as any)[mutationName](...payload);
    };
    this.commit = Object.assign(commitFunc, this.mappedMutations);

    const dispatchFunc: DispatchFunc<Actions> = (actionName, ...payload) => {
      return (this.mappedActions as any)[actionName](...payload);
    };
    this.dispatch = Object.assign(dispatchFunc, this.mappedActions);
  }

  // --- Vuex-related props/methods ----------------------------------------- //

  /** Get this module's state from its registered Vuex store. */
  get state(): ModuleState {
    if (moduleIsBound(this)) {
      const modulePath = this.namespacedKey.split('/');
      const store = getStore(this);
      let stateObj = store.state;

      for (const part of modulePath) {
        stateObj = stateObj[part];
      }

      return stateObj;
    }

    throw new Error(
      `Module '${this.name}' is not registered to a Vuex store. Call '${
        this.name
      }.register()' before attempting to access state.`,
    );
  }

  // --- VuexTS-related utilities ------------------------------------------- //

  /** Gets the stringified namespace key for this module. */
  get namespacedKey() {
    return qualifyNamespace(this);
  }

  /** Gets the raw Vuex module. */
  get vuexModule(): Module<ModuleState, RootState> {
    return {
      namespaced: true,
      state: () => this.initialState || ({} as any),
      getters: this.staticGetters,
      mutations: this.staticMutations,
      actions: this.staticActions,
    };
  }

  /** Register this module to the provided Vuex store. */
  register(store: Store<RootState>): void {
    if (moduleIsBound(this)) {
      if (getStore(this) === store) {
        // If we are attempting to register to the same store, warn and skip the step.
        console.warn(
          `Module '${this.namespacedKey}' is already registered to the provided store. There is no need to call '${
            this.name
          }.register()' again.`,
        );
      } else {
        // If we are attempting to register to another Vuex store, raise an
        // error and explain possible steps to resolve the issue.
        throw new Error(
          `Module '${
            this.namespacedKey
          }' is registered to another Vuex store. VuexTs modules can only be registered to one Vuex store at a time. You can unregister this module by calling '${
            this.name
          }.unregister()' or create a new module instance with 'createVuexTsModule(...)'.`,
        );
      }

      return;
    }

    bindModuleToStore(this, store);
  }

  /** Unregister this module from its bound Vuex store. */
  unregister(): void {
    unbindModuleFromStore(this);
  }
}

// --- VuexTsModule Factory ------------------------------------------------- //

/**
 * Builds a strongly-typed Vuex module.
 *
 * @example
 * // Compose your module:
 * const myModule = createVuexTsModule({
 *   name: 'myModule',
 *   state,
 *   getters,
 *   mutations,
 *   actions,
 * });
 *
 * // Register your module dynamically to a Vuex store:
 * myModule.register(store);
 *
 * // Likewise, you can unregister your module:
 * myModule.unregister();
 */
export function createVuexTsModule<
  ModuleState,
  RootState,
  Getters extends ModuleGetters<ModuleState, RootState>,
  Mutations extends ModuleMutations<ModuleState>,
  Actions extends ModuleActions<ModuleState, RootState>
>({
  name,
  state,
  getters,
  mutations,
  actions,
  modules,
}: {
  name: string;
  state?: ModuleState;
  getters?: ConstructorOf<Getters>;
  mutations?: ConstructorOf<Mutations>;
  actions?: ConstructorOf<Actions>;
  modules?: VuexTsModule<any, RootState, any, any, any>[];
}): VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions> {
  return new VuexTsModule({
    name,
    state,
    getters,
    mutations,
    actions,
    modules,
  });
}
