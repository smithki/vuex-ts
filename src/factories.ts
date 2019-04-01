// --- Imports -------------------------------------------------------------- //

import { ModuleGetters } from './module-parts';
import { VuexTsModuleBuilder } from './typed-module';
import {
  ChildState,
  CompositeVuexTsModule,
  ConstructorOf,
  InferChildren,
  InferModuleState,
  InferRootState,
} from './types';

// -------------------------------------------------------------------------- //

export const VuexTsFactories = {
  /**
   * Create an instance of VuexTSModuleBuilder. This class wraps the
   * instantiation of VuexTsModule to enable better type inference.
   *
   * @example
   * // Compose your module:
   * const myModule = VuexTsFactories.moduleBuilder({
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
   *
   * // Or create the Vuex store directly from the module:
   * myModule.toStore();
   */
  moduleBuilder<ModuleState, RootState>({
    name,
    state,
  }: {
    name: string;
    state?: ModuleState | (() => ModuleState);
  }): VuexTsModuleBuilder<ModuleState, RootState> {
    return new VuexTsModuleBuilder<ModuleState, RootState>({
      name,
      state: state || ({} as any),
    });
  },

  getters<TModuleFactory extends () => CompositeVuexTsModule>(
    parentModule?: TModuleFactory,
  ): ConstructorOf<
    ModuleGetters<
      InferModuleState<ReturnType<TModuleFactory>>,
      InferRootState<ReturnType<TModuleFactory>>,
      ChildState<InferChildren<ReturnType<TModuleFactory>>>
    >
  > {
    return ModuleGetters as any;
  },
};
