import Vue from 'vue';
import Vuex from 'vuex';
import { registerVuexTsModules, StateInterfaceFromModule } from '../src';
import { doggoState } from './doggos';
import { kittenState } from './kittens';

Vue.use(Vuex);

export const store = new Vuex.Store({
  plugins: [registerVuexTsModules(doggoState, kittenState)],
});
