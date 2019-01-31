import { ActionContext, Module, Store } from 'vuex';
import { bindModuleToStore, getStore, moduleIsBound, qualifyNamespace, unbindModuleFromStore } from './lib';
import {
  context,
  id,
  initialState,
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
  CommitFunc,
  ConstructorOf,
  DispatchFunc,
  MappedKnownKeys,
  StaticActions,
  StaticChildren,
  StaticGetters,
  StaticMutations,
} from './types';

// --- Getters -------------------------------------------------------------- //

export abstract class ModuleGetters<ModuleState, RootState> {
  constructor(parentModule: VuexTsModule<ModuleState, RootState, any, any, any, any>) {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(parentModule)) {
            throw new Error(
              `You must register '${parentModule.name}' to a Vuex store before accessing getters. Call '${
                parentModule.name
              }.register(store)'`,
            );
          }

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

      result[name] = (vuexState, vuexRootState) => {
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

  [state]: ModuleState;
  [rootState]: RootState;
}

// --- Mutations ------------------------------------------------------------ //

export abstract class ModuleMutations<ModuleState> {
  constructor(parentModule: VuexTsModule<ModuleState, any, any, any, any, any>) {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(parentModule)) {
            throw new Error(
              `You must register '${parentModule.name}' to a Vuex store before committing mutations. Call '${
                parentModule.name
              }.register(store)'`,
            );
          }

          return (payload: any) => {
            getStore(parentModule).commit(`${parentModule.namespaceKey}/${prop}`, payload, { root: true }) as any;
          };
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  get [staticMutations]() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor');
    const result: StaticGetters = {};

    for (const name of methodNames) {
      const proto = Object.getPrototypeOf(this);
      const unwrappedProxy = Object.create(proto);

      result[name] = (vuexState, payload) => {
        const mutContext = new Proxy(unwrappedProxy, {
          get: (target, prop, reciever) => {
            if (prop === state) return vuexState;
            return Reflect.get(target, prop, reciever);
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

export abstract class ModuleActions<ModuleState, RootState> {
  constructor(parentModule: VuexTsModule<ModuleState, RootState, any, any, any, any>) {
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop !== 'symbol') {
          if (!moduleIsBound(parentModule)) {
            throw new Error(
              `You must register '${parentModule.name}' to a Vuex store before dispatching actions. Call '${
                parentModule.name
              }.register(store)'`,
            );
          }

          return (payload: any) => {
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
    const result: StaticGetters = {};

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
  [key: string]: VuexTsModule<any, any, any, any, any, any>;

  get [staticChildren]() {
    const moduleNames = Object.getOwnPropertyNames(this);
    const result: StaticChildren = {};

    for (const name of moduleNames) {
      result[name] = this[name].clone(name);
    }

    return result;
  }
}

// --- Module --------------------------------------------------------------- //

export class VuexTsModule<
  ModuleState,
  RootState,
  Getters extends ModuleGetters<ModuleState, RootState>,
  Mutations extends ModuleMutations<ModuleState>,
  Actions extends ModuleActions<ModuleState, RootState>,
  Modules extends ModuleChildren
> {
  readonly [id]: symbol;
  readonly [staticGetters]: StaticGetters;
  readonly [staticMutations]: StaticMutations;
  readonly [staticActions]: StaticActions;
  readonly [staticChildren]: StaticChildren;
  readonly [initialState]: ModuleState | undefined;

  /**
   * This module's name.
   *
   * @type {string}
   * @memberof VuexTsModule
   */
  readonly name: string;

  /**
   * Dynamic getters registered in this modules.
   *
   * @type {Getters}
   * @memberof VuexTsModule
   */
  readonly getters: Getters;

  /**
   * Commit mutations registered in this module.
   *
   * @type {(CommitFunc<Mutations> & MappedKnownKeys<Mutations>)}
   * @memberof VuexTsModule
   */
  readonly commit: CommitFunc<Mutations> & MappedKnownKeys<Mutations>;

  /**
   * Dispatch actions registered in this module.
   *
   * @type {(DispatchFunc<Actions> & MappedKnownKeys<Actions>)}
   * @memberof VuexTsModule
   */
  readonly dispatch: DispatchFunc<Actions> & MappedKnownKeys<Actions>;

  /**
   * Create a new VuexTsModule instance with the same getters, mutations,
   * actions, and nested modules.
   *
   * @param {string} [name] - A new `name` for the created VuexTsModule to adopt.
   * @returns {void}
   * @memberof VuexTsModule
   */
  readonly clone: (name?: string) => VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions, Modules>;

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
    modules?: ConstructorOf<Modules>;
  }) {
    // --- Initialize instance properties --- //

    this.name = moduleName;
    this[id] = Symbol(this.name);
    if (moduleState) this[initialState] = moduleState;

    // --- Build `clone(...)` method --- //

    this.clone = name => {
      return vuexTsBuilder<ModuleState, RootState>({
        name: name || moduleName,
        state: moduleState,
      }).inject({
        getters,
        mutations,
        actions,
        modules,
      });
    };

    // --- Build strongly-typed getters --- //

    if (getters) {
      this.getters = new getters(this);
      this[staticGetters] = this.getters[staticGetters];
    }

    // --- Build strongly-typed mutations --- //

    if (mutations) {
      const mutInst = new mutations(this);
      this[staticMutations] = mutInst[staticMutations];

      const commitFunc: CommitFunc<Mutations> = (mutationName, ...payload) => {
        (mutInst as any)[mutationName](...payload);
      };

      const mappedMutations: any = {};

      for (const handler of Object.keys(this[staticMutations])) {
        mappedMutations[handler] = (...payload: any[]) => mutInst[handler](...payload);
      }

      this.commit = Object.assign(commitFunc, mappedMutations);
    }

    // --- Build strongly-typed actions --- //

    if (actions) {
      const actInst = new actions(this);
      this[staticActions] = actInst[staticActions];

      const dispatchFunc: DispatchFunc<Actions> = (actionName, ...payload) => {
        return (actInst as any)[actionName](...payload);
      };

      const mappedActions: any = {};

      for (const handler of Object.keys(this[staticActions])) {
        mappedActions[handler] = (...payload: any[]) => actInst[handler](...payload);
      }

      this.dispatch = Object.assign(dispatchFunc, mappedActions);
    }

    // --- Build nested modules --- //

    if (modules) {
      const children = new modules()[staticChildren];
      this[staticChildren] = children;
      return Object.assign(this, children);
    }

    this[staticChildren] = {};
  }

  // --- Vuex-related props/methods ----------------------------------------- //

  /**
   * This module's dynamic state.
   *
   * @readonly
   * @type {(ModuleState & ChildState<Modules>)}
   * @memberof VuexTsModule
   */
  get state(): ModuleState & ChildState<Modules> {
    if (moduleIsBound(this)) {
      const modulePath = this.namespaceKey.split('/');
      let stateObj = getStore(this).state;

      for (const part of modulePath) {
        stateObj = stateObj[part];
      }

      return stateObj;
    }

    // Raise an error is this module is not bound to a store yet.
    throw new Error(
      `Module '${this.name}' is not registered to a Vuex store. Call '${
        this.name
      }.register(store)' before accessing state.`,
    );
  }

  // --- VuexTS-related utilities ------------------------------------------- //

  /**
   * The stringified namespace key for this VuexTsModule.
   *
   * @readonly
   * @memberof VuexTsModule
   */
  get namespaceKey() {
    if (moduleIsBound(this)) {
      return qualifyNamespace(this);
    }

    throw new Error(
      `Module '${this.name}' is not registered to a Vuex store. Call '${
        this.name
      }.register(store)' before accessing 'namespaceKey'.`,
    );
  }

  /**
   * The raw underlying Vuex module for this VuexTsModule.
   *
   * @readonly
   * @type {Module<ModuleState, RootState>}
   * @memberof VuexTsModule
   */
  get [vuexModule](): Module<ModuleState, RootState> {
    return {
      namespaced: true,
      state: () => this[initialState] || ({} as any),
      getters: this[staticGetters],
      mutations: this[staticMutations],
      actions: this[staticActions],
    };
  }

  /**
   * Register this module to the provided Vuex store.
   *
   * @param {Store<RootState>} store - The Vuex store to bind this VuexTsModule to.
   * @returns {void}
   * @memberof VuexTsModule
   */
  register(store: Store<RootState>): void {
    if (moduleIsBound(this)) {
      if (getStore(this) === store) {
        // If we are attempting to register to the same store, warn and skip the step.
        console.warn(
          `Module '${this.namespaceKey}' is already registered to the provided store. There is no need to call '${
            this.name
          }.register()' again.`,
        );
      } else {
        // If we are attempting to register to another Vuex store, raise an
        // error and explain possible steps to resolve the issue.
        throw new Error(
          `Module '${
            this.namespaceKey
          }' is registered to another Vuex store. VuexTs modules can only be registered to one Vuex store at a time. You can unregister this module by calling '${
            this.name
          }.unregister()' or create a new module instance with 'createVuexTsModule(...)'.`,
        );
      }

      return;
    }

    bindModuleToStore(this, store);
  }

  /**
   * Unregister this module from its bound Vuex store.
   *
   * @memberof VuexTsModule
   */
  unregister(): void {
    if (moduleIsBound(this)) unbindModuleFromStore(this);
  }
}

// --- Builder -------------------------------------------------------------- //

export class VuexTsModuleBuilder<ModuleState, RootState> {
  readonly name: string;
  readonly state: ModuleState;

  constructor({ name, state }: { name: string; state: ModuleState }) {
    this.name = name;
    this.state = state;
  }

  /**
   * Create a VuexTsModule with injected getters, mutations, actions, and child
   * modules.
   *
   * @template Getters
   * @template Mutations
   * @template Actions
   * @template Modules
   * @param {{
   *     getters?: ConstructorOf<Getters>;
   *     mutations?: ConstructorOf<Mutations>;
   *     actions?: ConstructorOf<Actions>;
   *     modules?: ConstructorOf<Modules>;
   *   }} [{
   *     getters,
   *     mutations,
   *     actions,
   *     modules,
   *   }={}] - Configuration object containing getters, mutations, actions, and nested modules.
   * @returns {(VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions, Modules> & Modules)}
   * @memberof VuexTsModuleBuilder
   */
  inject<
    Getters extends ModuleGetters<ModuleState, RootState>,
    Mutations extends ModuleMutations<ModuleState>,
    Actions extends ModuleActions<ModuleState, RootState>,
    Modules extends ModuleChildren
  >({
    getters,
    mutations,
    actions,
    modules,
  }: {
    getters?: ConstructorOf<Getters>;
    mutations?: ConstructorOf<Mutations>;
    actions?: ConstructorOf<Actions>;
    modules?: ConstructorOf<Modules>;
  } = {}): VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions, Modules> & Modules {
    return new VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions, Modules>({
      getters,
      mutations,
      actions,
      modules,
      name: this.name,
      state: this.state,
    }) as any;
  }
}

// --- VuexTsModule Factory ------------------------------------------------- //

/**
 * Create an instance VuexTSModuleBuilder.
 *
 * @example
 * // Compose your module:
 * const myModule = vuexTsBuilder({
 *   name: 'myModule',
 *   state,
 * }).inject({
 *   getters,
 *   mutations,
 *   actions,
 *   modules,
 * });
 *
 * // Register your module dynamically to a Vuex store:
 * myModule.register(store);
 *
 * // Likewise, you can unregister your module:
 * myModule.unregister();
 */
export function vuexTsBuilder<ModuleState, RootState>({
  name,
  state,
}: {
  name: string;
  state?: ModuleState;
}): VuexTsModuleBuilder<ModuleState, RootState> {
  return new VuexTsModuleBuilder<ModuleState, RootState>({
    name,
    state: state || ({} as any),
  });
}
