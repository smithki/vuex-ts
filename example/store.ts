import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { registerVuexTsModules } from '../src';
import { todo } from './todo';

console.log(todo);

Vue.use(Vuex);

export const store = new Store({
  plugins: [registerVuexTsModules(todo)],
});

window.setTimeout(async () => {
  todo.commit('addTodoItem', { completed: false, description: 'Buy groceries.' });
}, 1000);
