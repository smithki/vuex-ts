// --- Imports -------------------------------------------------------------- //

import { parent } from './symbols';
import {
  ConstructorOf,
  InferChildStateFromParent,
  InferModuleStateFromParent,
  InferRootStateFromParent,
} from './types/utility-types';
import { VuexTsModule } from './vuex-ts-module';

// -- Base module part ------------------------------------------------------ //

export abstract class ModulePart {
  public abstract [parent]: () => ConstructorOf<VuexTsModule>;
}

// --- Getters -------------------------------------------------------------- //

export abstract class ModuleGetters extends ModulePart {
  state: InferModuleStateFromParent<this> & InferChildStateFromParent<this>;
  rootState: InferRootStateFromParent<this>;
}

// --- Mutations ------------------------------------------------------------ //

export abstract class ModuleMutations extends ModulePart {
  state: InferModuleStateFromParent<this>;

  [key: string]: (payload?: any) => void;
}

// --- Actions -------------------------------------------------------------- //

export abstract class ModuleActions extends ModulePart {
  state: InferModuleStateFromParent<this>;
  rootState: InferRootStateFromParent<this>;

  [key: string]: (payload?: any) => Promise<any>;
}

// --- Child modules -------------------------------------------------------- //

export abstract class ModuleChildren extends ModulePart {
  [key: string]: () => ConstructorOf<VuexTsModule>;
}
