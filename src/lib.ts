import { Store } from 'vuex';
import { ModuleActions, ModuleGetters, ModuleMutations, VuexTsModule } from './typed-module';
import { ConstructorOf } from './types';

// --- Constants ------------------------------------------------------------ //

const vuexTsStoreCache = new Map<symbol, Store<any>>();
const vuexTsNamespaceCache = new Map<symbol, string[]>();

// --- Business logic ------------------------------------------------------- //

/** Generate a namespace key for use in Vuex `dispatch` and `commit` method arguments. */
export function qualifyNamespace(mod: VuexTsModule<any, any, any, any, any>): string {
  return vuexTsNamespaceCache.has(mod.id) ? `${vuexTsNamespaceCache.get(mod.id)!.join('/')}` : mod.name;
}

/** Bind a VuexTs module to a Vuex store instance. */
export function bindModuleToStore<RootState>(
  mod: VuexTsModule<any, any, any, any, any>,
  store: Store<RootState>,
  parentModuleNames: string[] = [],
) {
  if (!vuexTsNamespaceCache.has(mod.id)) vuexTsNamespaceCache.set(mod.id, [...parentModuleNames, mod.name]);
  store.registerModule(vuexTsNamespaceCache.get(mod.id)!, mod.vuexModule);
  vuexTsStoreCache.set(mod.id, store);
  if (mod.modules) {
    for (const m of mod.modules) bindModuleToStore(m, store, [...vuexTsNamespaceCache.get(mod.id)!]);
  }
}

/** Unbind a VuexTs module from its currently bound Vuex store instance. */
export function unbindModuleFromStore(mod: VuexTsModule<any, any, any, any, any>) {
  getStore(mod).unregisterModule(vuexTsNamespaceCache.get(mod.id)!);
  vuexTsStoreCache.delete(mod.id);
  vuexTsNamespaceCache.delete(mod.id);
  if (mod.modules) {
    for (const m of mod.modules) unbindModuleFromStore(m);
  }
}

/** Check if a module is already bound to a store. */
export function moduleIsBound(mod: VuexTsModule<any, any, any, any, any>) {
  return vuexTsStoreCache.has(mod.id);
}

/** Get the Vuex store instance assciated with the given VuexTs module's ID. */
export function getStore(mod: VuexTsModule<any, any, any, any, any>): Store<any> {
  return vuexTsStoreCache.get(mod.id) as Store<any>;
}

/**
 * Registers VuexTs modules to the provided store.
 *
 * @example
 * // Usage as a plugin
 * const store = new Vuex.Store({
 *   plugins: [registerVuexTsModules(...vuexTsModules)],
 * });
 */
export function registerVuexTsModules<RootState>(...vuexTsModules: VuexTsModule<any, RootState, any, any, any>[]) {
  return (store: Store<RootState>) => {
    vuexTsModules.forEach(mod => mod.register(store));
  };
}

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
