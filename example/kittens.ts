import { ModuleChildren, ModuleGetters, ModuleMutations, state, vuexTsBuilder, VuexTsModule } from '../src';
import { doggoState } from './doggos';
import { RootState } from './store';

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

class KittenGetters extends ModuleGetters<KittenState, RootState> {
  get oldestKitten() {
    return this[state].kittens.reduce((a, b) => (a.age > b.age ? a : b));
  }

  get youngestKitten() {
    return this[state].kittens.reduce((a, b) => (a.age < b.age ? a : b));
  }
}

// --- Mutations --- //

class KittenMutations extends ModuleMutations<KittenState> {
  addKitten(payload: Kitten) {
    this[state].kittens.push(payload);
  }
}

// --- Nested modules --- //

class KittenChildren extends ModuleChildren {
  doggoNested = () => doggoState;
}

// --- Module --- //

export const kittenState = vuexTsBuilder<KittenState, RootState>({
  name: 'kittenState',
  state: () => ({
    kittens: [
      {
        name: 'Mittens',
        breed: KittenBreed.Dmh,
        age: 4,
      },
    ],
  }),
}).inject({
  getters: KittenGetters,
  mutations: KittenMutations,
  modules: KittenChildren,
});
