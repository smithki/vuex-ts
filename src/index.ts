export { vuexTsModuleBuilder, VuexTsModule, VuexTsModuleInstance } from './vuex-ts-module';
export { registerVuexTsModules } from './lib';
export { ModuleGetters, ModuleMutations, ModuleActions, ModuleChildren } from './module-parts';
export { StateInterfaceFromModule } from './types';
export { usedIn } from './symbols';

import { getContext, getModule, getRootState, getState } from './symbols';
export const get = {
  context: getContext as typeof getContext,
  module: getModule as typeof getModule,
  rootState: getRootState as typeof getRootState,
  state: getState as typeof getState,
};
