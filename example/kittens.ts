import { ModuleChildren, ModuleGetters, ModuleMutations, usedIn, VuexTsModule, vuexTsModuleBuilder } from '../src';
import { DoggoModule } from './doggos';
import { RootState } from './root-state';

export enum KittenBreed {
  Dsh = 'DOMESTIC_SHORT_HAIR',
  Dmh = 'DOMESTIC_MEDIUM_HAIR',
  Dlh = 'DOMESTIC_LONG_HAIR',
}

export interface Kitten {
  name: string;
  breed: KittenBreed;
  age: number;
}

export interface KittenState {
  kittens: Kitten[];
}
// --- Getters --- //

export class KittenGetters extends ModuleGetters {
  [usedIn] = () => KittenModule;

  get oldestKitten() {
    return this.state.kittens.reduce((a, b) => (a.age > b.age ? a : b));
  }

  get youngestKitten() {
    return this.state.kittens.reduce((a, b) => (a.age < b.age ? a : b));
  }
}

// --- Mutations --- //

export class KittenMutations extends ModuleMutations {
  [usedIn] = () => KittenModule;

  addKitten(payload: Kitten) {
    this.state.this.state.kittens.push(payload);
  }
}

// --- Nested modules --- //

export class KittenChildren extends ModuleChildren {
  [usedIn] = () => KittenModule;

  doggoNested = () => DoggoModule;
}

// --- Module --- //

export class KittenModule extends VuexTsModule<KittenState, RootState> {
  name = 'kittenState';

  state = () => ({
    kittens: [
      {
        name: 'Mittens',
        breed: KittenBreed.Dmh,
        age: 4,
      },
    ],
  });

  getters = () => KittenGetters;
  mutations = () => KittenMutations;
  modules = () => KittenChildren;
}

export const kittenState = vuexTsModuleBuilder(KittenModule);
