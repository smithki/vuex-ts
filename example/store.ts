import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { registerVuexTsModules } from '../src';
import { todo } from './todo';
import { todoNested } from './todo-nested';
import { TodoActions } from './todo-nested/todo.actions';

console.log(todo);

Vue.use(Vuex);

export const store = new Store({
  plugins: [registerVuexTsModules(todo)],
});

window.setTimeout(async () => {
  todo.commit('addTodoItem', { completed: false, description: 'Buy groceries.' });
  todo.todoNested.commit.addTodoItem({ completed: true, description: 'asdfasdfas' });
  console.log(todoNested.namespaceKey);
}, 1000);
