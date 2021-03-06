// --- Imports -------------------------------------------------------------- //

// Vendor
import { Module, Store } from 'vuex';

// Internal
import {
  InvalidStoreError,
  ModuleBoundToDifferentStoreError,
  ModuleBoundToSameStoreError,
  ModuleNotBoundToStoreError,
  NestedModuleUnregisterError,
  RootModuleUnregisterError,
  UndefinedStoreError,
} from './exceptions';
import {
  bindModuleToStore,
  getModule,
  getStore,
  moduleIsBound,
  qualifyNamespace,
  registerVuexTsModules,
  unbindModuleFromStore,
} from './lib';
import { ModuleActions, ModuleChildren, ModuleGetters, ModuleMutations } from './module-parts';
import * as Symbols from './symbols';
import * as Types from './types';

// -------------------------------------------------------------------------- //

export abstract class VuexTsModule<TModuleState = any, TRootState = any> {
  /**
   * A type signature which assists in extracting type information from the
   * module.
   */
  public [Symbols.typeMetadata]: [
    this,
    TModuleState,
    TRootState,
    Types.UnwrapModulePartFactory<this['getters']>,
    Types.UnwrapModulePartFactory<this['mutations']>,
    Types.UnwrapModulePartFactory<this['actions']>,
    Types.UnwrapModulePartFactory<this['modules']>
  ];

  /** The name of this module. */
  public abstract name: string;

  /** The initial state (and state interface) of this module. */
  public state: () => TModuleState;

  /** Getter handlers for this module. */
  public getters?: () => Types.ConstructorOf<ModuleGetters>;

  /** Mutation handlers for this module. */
  public mutations?: () => Types.ConstructorOf<ModuleMutations>;

  /** Action handlers for this module. */
  public actions?: () => Types.ConstructorOf<ModuleActions>;

  /** Child module definitions. */
  public modules?: () => Types.ConstructorOf<ModuleChildren>;
}

// -------------------------------------------------------------------------- //

export class VuexTsModuleInstance<TModule extends VuexTsModule> {
  public readonly [Symbols.id]: symbol;
  public readonly [Symbols.staticGetters]: Types.StaticGetters;
  public readonly [Symbols.staticMutations]: Types.StaticMutations;
  public readonly [Symbols.staticActions]: Types.StaticActions;
  public readonly [Symbols.staticChildren]: Types.StaticChildren;
  public readonly [Symbols.children]: Types.GetChildren<TModule>;
  public readonly [Symbols.initialState]: any;
  public [Symbols.isRoot]: boolean;
  public [Symbols.isNested]: boolean;
  public [Symbols.parentId]: symbol | undefined;

  /** This module's name. */
  name: string;

  /** Dynamic getters registered in this modules. */
  readonly getters: Types.GetGetters<TModule>;

  /** Commit mutations registered in this module. */
  readonly commit: Types.GetMutations<TModule>;

  /** Dispatch actions registered in this module. */
  readonly dispatch: Types.GetActions<TModule>;

  /**
   * Create a new VuexTsModule instance with the same getters, mutations,
   * actions, and nested modules.
   *
   * @param name - A new `name` for the created VuexTsModule to adopt.
   */
  readonly clone: (name?: string) => VuexTsModuleInstance<TModule> & Types.GetChildModuleProxies<TModule>;

  constructor(VuexTsModuleConstructor: Types.ConstructorOf<TModule>) {
    const modInst = new VuexTsModuleConstructor();

    // --- Initialize instance properties --- //

    this.name = modInst.name;
    this[Symbols.id] = Symbol(this.name);
    this[Symbols.initialState] = typeof modInst.state === 'function' ? modInst.state() : modInst.state;
    this[Symbols.isRoot] = false;
    this[Symbols.isNested] = false;
    this[Symbols.parentId] = undefined;

    // --- Build `clone(...)` method --- //

    this.clone = name => {
      const result = vuexTsModuleBuilder(VuexTsModuleConstructor);
      result.name = name || this.name;
      return result as any;
    };

    // --- Build strongly-typed getters --- //

    if (modInst.getters) {
      const GettersConstructor = modInst.getters();
      const gettersInst = new GettersConstructor(this);
      this[Symbols.staticGetters] = gettersInst[Symbols.staticGetters];

      const mappedGetters: any = {};

      // const gettersUnwrappedProxy = Object.create(Object.getPrototypeOf(gettersInst));
      for (const handler of Object.keys(this[Symbols.staticGetters])) {
        Object.defineProperty(mappedGetters, handler, {
          enumerable: true,
          get: () => (gettersInst as any)[handler],
        });
      }

      this.getters = mappedGetters;
    }

    // --- Build strongly-typed mutations --- //

    if (modInst.mutations) {
      const MutationsContructor = modInst.mutations();
      const mutInst = new MutationsContructor(this);
      this[Symbols.staticMutations] = mutInst[Symbols.staticMutations];

      const mappedMutations: any = {};

      for (const handler of Object.keys(this[Symbols.staticMutations])) {
        mappedMutations[handler] = (...payload: any[]) => mutInst[handler](...payload);
      }

      this.commit = mappedMutations;
    } else {
      this.commit = {} as any;
    }

    // --- Build strongly-typed actions --- //

    if (modInst.actions) {
      const ActionsConstructor = modInst.actions();
      const actInst = new ActionsConstructor(this);
      this[Symbols.staticActions] = actInst[Symbols.staticActions];

      const mappedActions: any = {};

      for (const handler of Object.keys(this[Symbols.staticActions])) {
        mappedActions[handler] = (...payload: any[]) => actInst[handler](...payload);
      }

      this.dispatch = mappedActions;
    } else {
      this.dispatch = {} as any;
    }

    // --- Build nested modules --- //

    if (modInst.modules) {
      const ModulesConstructor = modInst.modules();
      const childrenInst = new ModulesConstructor();
      const { staticChildren, vuexTsModuleInstances } = childrenInst[Symbols.children];
      this[Symbols.staticChildren] = staticChildren;
      this[Symbols.children] = vuexTsModuleInstances as any;
      return Object.assign(this, (vuexTsModuleInstances as any) as Types.GetChildModuleProxies<TModule>);
    }

    this[Symbols.staticChildren] = this[Symbols.children] = {} as any;
  }

  // --- Vuex-related props/methods ----------------------------------------- //

  /** This module's dynamic state. */
  get state(): Types.GetState<TModule> {
    if (moduleIsBound(this as any)) {
      if (this[Symbols.isRoot]) return getStore(this as any).state;

      const modulePath = this.namespaceKey.split('/');
      let stateObj = getStore(this as any).state;

      for (const part of modulePath) {
        stateObj = stateObj[part];
      }

      return stateObj;
    }

    // Raise an error is this module is not bound to a store yet.
    throw new ModuleNotBoundToStoreError(this.name, 'state');
  }

  // --- VuexTS-related utilities ------------------------------------------- //

  /** The stringified namespace key of this module. */
  get namespaceKey(): string {
    if (moduleIsBound(this as any)) {
      if (this[Symbols.isRoot]) return '';
      return qualifyNamespace(this as any);
    }

    throw new ModuleNotBoundToStoreError(this.name, 'namespaceKey');
  }

  /** The raw, underlying Vuex module. */
  get [Symbols.vuexModule](): Module<Types.GetState<TModule>, any> {
    return {
      namespaced: !this[Symbols.isRoot],
      state: this[Symbols.isRoot] ? this[Symbols.initialState] : () => this[Symbols.initialState],
      getters: this[Symbols.staticGetters],
      mutations: this[Symbols.staticMutations],
      actions: this[Symbols.staticActions],
      modules: this[Symbols.staticChildren],
    };
  }

  /**
   * Registers this module to the provided Vuex store. Any nested modules are
   * automatically registered as well.
   *
   * @param store - The Vuex store to bind this VuexTsModule to.
   */
  register(store: Store<any>): void {
    if (!store) throw new UndefinedStoreError(this.name);
    if (!(store instanceof Store)) throw new InvalidStoreError(this.name);

    if (moduleIsBound(this as any)) {
      if (getStore(this as any) === store) {
        // If we are attempting to register to the same store, warn and skip the step.
        throw new ModuleBoundToSameStoreError(this.name, this.namespaceKey);
      } else {
        // If we are attempting to register to another Vuex store, raise an
        // error and explain possible steps to resolve the issue.
        throw new ModuleBoundToDifferentStoreError(this.name, this.namespaceKey);
      }
    }

    bindModuleToStore(this as any, store);
  }

  /** Unregisters this module from its bound Vuex store. */
  unregister(): void {
    if (moduleIsBound(this as any)) {
      if (this[Symbols.isRoot]) throw new RootModuleUnregisterError(this.name);
      if (this[Symbols.isNested]) {
        const parentModule = getModule(this[Symbols.parentId]!);
        throw new NestedModuleUnregisterError(this.name, parentModule!.name, parentModule![Symbols.isRoot]);
      }
      unbindModuleFromStore(this as any);
    } else {
      throw new ModuleNotBoundToStoreError(this.name, 'unregister');
    }
  }

  /**
   * Create a Vuex store instance from this module. Any nested modules are
   * automatically registered as well.
   *
   * @param options - Options you would provide to `new Vuex.Store({ ... })`.
   */
  toStore(options: Types.BareStoreOptions<any> = {}): Store<any> {
    this[Symbols.isRoot] = true;
    const registration = [registerVuexTsModules(this as any)];

    // Apply plugins
    if (options.plugins && Array.isArray(options.plugins)) options.plugins.unshift(...registration);
    else options.plugins = registration;

    const rootModule = { ...this[Symbols.vuexModule], ...options };

    return new Store(rootModule as any) as any;
  }
}

/**
 * Proxies certain properties of `VuexTsModuleInstance`, used internally to
 * solve circular type references.
 */
export abstract class VuexTsModuleInstanceProxy<TModule extends VuexTsModule> {
  readonly state: Types.GetState<TModule>;
  readonly commit: Types.GetMutations<TModule>;
  readonly dispatch: Types.GetActions<TModule>;
  readonly getters: Types.GetGetters<TModule>;
}

/**
 * Builds a strongly-typed Vuex module.
 *
 * @param VuexTsModuleConstructor - A `VuexTsModule` constructor.
 */
export function vuexTsModuleBuilder<TModule extends VuexTsModule>(
  VuexTsModuleConstructor: Types.ConstructorOf<TModule>,
): VuexTsModuleInstance<TModule> & Types.GetChildModuleProxies<TModule> {
  return new VuexTsModuleInstance(VuexTsModuleConstructor) as any;
}
