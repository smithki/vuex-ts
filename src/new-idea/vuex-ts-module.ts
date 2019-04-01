// --- Imports -------------------------------------------------------------- //

import { ModuleActions, ModuleChildren, ModuleGetters, ModuleMutations } from './module-parts';
import { typeMetadata } from './symbols';
import { ConstructorOf, UnwrapModulePartFactory } from './types/utility-types';

// -------------------------------------------------------------------------- //

export abstract class VuexTsModule<TModuleState = any, TRootState = any> {
  /**
   * A type signature which assists in extracting type information from the
   * module.
   */
  public [typeMetadata]: [
    TModuleState,
    TRootState,
    UnwrapModulePartFactory<this['getters']>,
    UnwrapModulePartFactory<this['mutations']>,
    UnwrapModulePartFactory<this['actions']>,
    UnwrapModulePartFactory<this['children']>
  ];

  /** The name of this module. */
  public abstract name: string;

  /** The initial state (and state interface) of this module. */
  public abstract state: TModuleState | (() => TModuleState);

  public getters?: () => ConstructorOf<ModuleGetters>;
  public mutations?: () => ConstructorOf<ModuleMutations>;
  public actions?: () => ConstructorOf<ModuleActions>;
  public children?: () => ConstructorOf<ModuleChildren>;
}

// -------------------------------------------------------------------------- //

export class VuexTsModuleBuilder<TModule extends VuexTsModule> {
  constructor(module: ConstructorOf<TModule>) {}
}
