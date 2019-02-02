import { ModuleGetters, ModuleMutations, rootState, state, vuexTsBuilder } from '../src';
import { RootState } from './store';

export enum DoggoBreed {
  Golden = 'GOLDEN_RETRIEVER',
  Basset = 'BASSET_HOUND',
}

export interface Doggo {
  name: string;
  breed: DoggoBreed;
  age: number;
}

export interface DoggoState {
  doggos: Doggo[];
}

// --- Getters --- //

class DoggoGetters extends ModuleGetters<DoggoState, RootState> {
  get oldestDoggo() {
    return this[state].doggos.reduce((a, b) => (a.age > b.age ? a : b));
  }

  get youngestDoggo() {
    return this[state].doggos.reduce((a, b) => (a.age < b.age ? a : b));
  }
}

// --- Mutations --- //

class DoggoMutations extends ModuleMutations<DoggoState> {
  addDoggo(payload: Doggo) {
    this[state].doggos.push(payload);
  }
}

// --- Module --- //

export const doggoState = vuexTsBuilder<DoggoState, RootState>({
  name: 'doggoState',
  state: () => ({
    doggos: [
      {
        name: 'Fido',
        breed: DoggoBreed.Basset,
        age: 7,
      },
    ],
  }),
}).inject({
  getters: DoggoGetters,
  mutations: DoggoMutations,
});
