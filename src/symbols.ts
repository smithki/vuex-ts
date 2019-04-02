// --- Exposed -------------------------------------------------------------- //

export const getState = Symbol('state');
export const getRootState = Symbol('state');
export const getContext = Symbol('context');
export const getModule = Symbol('Module');
export const usedIn = Symbol('usedIn');

// -------------------------------------------------------------------------- //
// Using symbols for internal-only properties leads to cleaner editor
// integration, showing only relevant methods and properties to the end-user.

export const typeMetadata = Symbol('metadata');
export const staticGetters = Symbol('staticGetters');
export const staticMutations = Symbol('staticMutations');
export const staticActions = Symbol('staticActions');
export const staticChildren = Symbol('staticChildren');
export const children = Symbol('children');
export const getUnwrappedProxy = Symbol('getUnwrappedProxy');
export const initialState = Symbol('initialState');
export const vuexModule = Symbol('vuexModule');
export const id = Symbol('id');
export const parentId = Symbol('parentId');
export const isRoot = Symbol('isRoot');
export const isNested = Symbol('isNested');
export const vuexTsModuleInstance = Symbol('vuexTsModuleInstance');
