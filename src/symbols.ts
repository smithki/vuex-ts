// --- Exposed --- //
export const state = Symbol('VuexTs state getter');
export const context = Symbol('VuexTs context getter');
export const rootState = Symbol('VuexTs rootState getter');

// --- Internal --- //
// Using symbols for internal-only properties leads to cleaner editor
// integration, showing only relevant methods and properties to the end-user.
export const staticGetters = Symbol('VuexTs static getters');
export const staticMutations = Symbol('VuexTs static mutations');
export const staticActions = Symbol('VuexTs static actions');
export const staticChildren = Symbol('VuexTs nested modules');
export const initialState = Symbol('VuexTs initial state');
export const vuexModule = Symbol('VuexTs raw Vuex module');
export const id = Symbol('VuexTs module id');
