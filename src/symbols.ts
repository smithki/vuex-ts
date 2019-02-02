// --- Exposed --- //
export const state = Symbol('state');
export const context = Symbol('context');
export const rootState = Symbol('rootState');

// --- Internal --- //
// Using symbols for internal-only properties leads to cleaner editor
// integration, showing only relevant methods and properties to the end-user.
export const staticGetters = Symbol('staticGetters');
export const staticMutations = Symbol('staticMutations');
export const staticActions = Symbol('staticActions');
export const staticChildren = Symbol('staticChildren');
export const children = Symbol('children');
export const initialState = Symbol('initialState');
export const vuexModule = Symbol('vuexModule');
export const id = Symbol('id');
export const parentId = Symbol('parentId');
export const isRoot = Symbol('isRoot');
export const isNested = Symbol('isNested');
