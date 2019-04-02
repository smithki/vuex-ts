import { Store } from 'vuex';
import { children, id, isNested, isRoot, parentId, vuexModule } from './symbols';
import { VuexTsModule, VuexTsModuleInstance } from './vuex-ts-module';

// --- Constants ------------------------------------------------------------ //

const vuexTsStoreRelationships = new Map<symbol, Store<any>>();
const vuexTsNamespaceRelationships = new Map<symbol, string[]>();
const vuexTsModuleIdRelationships = new Map<symbol, VuexTsModuleInstance<any>>();

// --- Business logic ------------------------------------------------------- //

/** Generate a namespace key for use in Vuex `dispatch` and `commit` method arguments. */
export function qualifyNamespace(mod: VuexTsModuleInstance<any>): string {
  return vuexTsNamespaceRelationships.has(mod[id])
    ? `${vuexTsNamespaceRelationships.get(mod[id])!.join('/')}`
    : mod.name;
}

/** Bind a VuexTs module to a Vuex store instance. */
export function bindModuleToStore(
  mod: VuexTsModuleInstance<any>,
  store: Store<any>,
  parentModuleNames: string[] = [],
  isModNested: boolean = false,
  parentModId?: symbol,
) {
  if (!vuexTsNamespaceRelationships.has(mod[id])) {
    if (mod[isRoot]) vuexTsNamespaceRelationships.set(mod[id], []);
    else vuexTsNamespaceRelationships.set(mod[id], [...parentModuleNames, mod.name]);
  }

  if (!parentModuleNames.length && !mod[isRoot] && !isModNested) {
    store.registerModule(vuexTsNamespaceRelationships.get(mod[id])!, mod[vuexModule]);
  }

  vuexTsStoreRelationships.set(mod[id], store);
  vuexTsModuleIdRelationships.set(mod[id], mod);

  mod[isNested] = isModNested;
  mod[parentId] = parentModId;

  for (const m of Object.values(mod[children])) {
    bindModuleToStore(m as any, store, [...vuexTsNamespaceRelationships.get(mod[id])!], true, mod[id]);
  }
}

/** Unbind a VuexTs module from its currently bound Vuex store instance. */
export function unbindModuleFromStore(mod: VuexTsModuleInstance<any>, isModNested: boolean = false) {
  if (!isModNested) getStore(mod).unregisterModule(vuexTsNamespaceRelationships.get(mod[id])!);
  vuexTsStoreRelationships.delete(mod[id]);
  vuexTsNamespaceRelationships.delete(mod[id]);
  vuexTsModuleIdRelationships.delete(mod[id]);
  for (const m of Object.values(mod[children])) unbindModuleFromStore(m as any, true);
}

/** Check if a module is already bound to a store. */
export function moduleIsBound(mod: VuexTsModuleInstance<any>) {
  return vuexTsStoreRelationships.has(mod[id]);
}

/** Get the Vuex store instance assciated with the given module. */
export function getStore(mod: VuexTsModuleInstance<any>): Store<any> {
  return vuexTsStoreRelationships.get(mod[id]) as Store<any>;
}

/** Get the module associated with the given ID. */
export function getModule(id: symbol): VuexTsModuleInstance<any> | undefined {
  return vuexTsModuleIdRelationships.has(id) ? vuexTsModuleIdRelationships.get(id) : undefined;
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
export function registerVuexTsModules<RootState>(...vuexTsModules: VuexTsModuleInstance<any>[]) {
  return (store: Store<RootState>) => {
    vuexTsModules.forEach(mod => mod.register(store));
  };
}
