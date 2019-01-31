import { Store } from 'vuex';
import { children, id, vuexModule } from './symbols';
import { VuexTsModule } from './typed-module';
import { CompositeVuexTsModule } from './types';

// --- Constants ------------------------------------------------------------ //

const vuexTsStoreCache = new Map<symbol, Store<any>>();
const vuexTsNamespaceCache = new Map<symbol, string[]>();

// --- Business logic ------------------------------------------------------- //

/** Generate a namespace key for use in Vuex `dispatch` and `commit` method arguments. */
export function qualifyNamespace(mod: VuexTsModule<any, any, any, any, any, any>): string {
  return vuexTsNamespaceCache.has(mod[id]) ? `${vuexTsNamespaceCache.get(mod[id])!.join('/')}` : mod.name;
}

/** Bind a VuexTs module to a Vuex store instance. */
export function bindModuleToStore(
  mod: VuexTsModule<any, any, any, any, any, any>,
  store: Store<any>,
  parentModuleNames: string[] = [],
) {
  if (!vuexTsNamespaceCache.has(mod[id])) vuexTsNamespaceCache.set(mod[id], [...parentModuleNames, mod.name]);
  if (!parentModuleNames.length) store.registerModule(vuexTsNamespaceCache.get(mod[id])!, mod[vuexModule]);
  vuexTsStoreCache.set(mod[id], store);
  for (const m of Object.values(mod[children])) {
    bindModuleToStore(m, store, [...vuexTsNamespaceCache.get(mod[id])!]);
  }
}

/** Unbind a VuexTs module from its currently bound Vuex store instance. */
export function unbindModuleFromStore(mod: VuexTsModule<any, any, any, any, any, any>) {
  getStore(mod).unregisterModule(vuexTsNamespaceCache.get(mod[id])!);
  vuexTsStoreCache.delete(mod[id]);
  vuexTsNamespaceCache.delete(mod[id]);
  for (const m of Object.values(mod[children])) unbindModuleFromStore(m);
}

/** Check if a module is already bound to a store. */
export function moduleIsBound(mod: VuexTsModule<any, any, any, any, any, any>) {
  return vuexTsStoreCache.has(mod[id]);
}

/** Get the Vuex store instance assciated with the given VuexTs module's ID. */
export function getStore(mod: VuexTsModule<any, any, any, any, any, any>): Store<any> {
  return vuexTsStoreCache.get(mod[id]) as Store<any>;
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
export function registerVuexTsModules<RootState>(
  ...vuexTsModules: CompositeVuexTsModule<any, RootState, any, any, any, any>[]
) {
  return (store: Store<RootState>) => {
    vuexTsModules.forEach(mod => mod.register(store));
  };
}
