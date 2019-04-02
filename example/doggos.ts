import { ModuleGetters, ModuleMutations, state, usedIn, VuexTsModule, vuexTsModuleBuilder } from '../src';
import { RootState } from './root-state';

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

export class DoggoGetters extends ModuleGetters {
  [usedIn] = () => DoggoModule;

  get oldestDoggo() {
    return this[state].doggos.reduce((a, b) => (a.age > b.age ? a : b));
  }

  get youngestDoggo() {
    return this[state].doggos.reduce((a, b) => (a.age < b.age ? a : b));
  }
}

// --- Mutations --- //

export class DoggoMutations extends ModuleMutations {
  [usedIn] = () => DoggoModule;

  addDoggo(payload: Doggo) {
    this[state].doggos.push(payload);
  }
}

// --- Module --- //

export class DoggoModule extends VuexTsModule<DoggoState, RootState> {
  name = 'doggoState';

  state = () => ({
    doggos: [
      {
        name: 'Fido',
        breed: DoggoBreed.Basset,
        age: 7,
      },
    ],
  });

  getters = () => DoggoGetters;
  mutations = () => DoggoMutations;
}

export const doggoState = vuexTsModuleBuilder(DoggoModule);
