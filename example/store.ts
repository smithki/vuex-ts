import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { registerVuexTsModules } from '../src';

Vue.use(Vuex);

export const store = new Store({
  plugins: [registerVuexTsModules()],
});
