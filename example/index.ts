// --- Imports --- //

import Vue from 'vue';

import { DoggoBreed, doggoState } from './doggos';
import { KittenBreed, kittenState } from './kittens';
import { store } from './store';

// --- Setup the Vue instance --- //

new Vue({
  store,
  el: document.getElementById('app'),
  render: h => h('div'),
});

// --- Do stuff with the Vuex store --- //

kittenState.doggoNested.commit.addDoggo({ name: 'Rover', breed: DoggoBreed.Golden, age: 10 });
doggoState.commit.addDoggo({ name: 'Dude', breed: DoggoBreed.Golden, age: 9 });
doggoState.commit.addDoggo({ name: 'Aristotle', breed: DoggoBreed.Basset, age: 14 });
kittenState.commit.addKitten({ name: 'Shadow', breed: KittenBreed.Dsh, age: 8 });

console.log('11', doggoState.getters.oldestDoggo.age);
console.log('12', kittenState.getters.oldestKitten);
