import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { registerVuexTsModules } from '../src';
import { DoggoBreed, doggoState } from './doggos';
import { KittenBreed, kittenState } from './kittens';

Vue.use(Vuex);

export const store = kittenState.toStore({
  plugins: [registerVuexTsModules(doggoState)],
});

kittenState.doggoNested.commit.addDoggo({ name: 'Rover', breed: DoggoBreed.Golden, age: 10 });
doggoState.commit.addDoggo({ name: 'Dude', breed: DoggoBreed.Golden, age: 9 });
doggoState.commit.addDoggo({ name: 'Aristotle', breed: DoggoBreed.Basset, age: 14 });
kittenState.commit.addKitten({ name: 'Shadow', breed: KittenBreed.Dsh, age: 8 });
