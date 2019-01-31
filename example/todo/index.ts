import { VuexTsModule } from '../../src';
import { ModuleGetters, vuexTsBuilder } from '../../src/typed-module';
import { todoNested } from '../todo-nested';
import { TodoActions } from './todo.actions';
import { TodoChildren } from './todo.children';
import { TodoGetters } from './todo.getters';
import { TodoState } from './todo.model';
import { TodoMutations } from './todo.mutations';

// export const todo = new VuexTsModule<TodoState, any, TodoGetters, TodoMutations, TodoActions>({
//   name: 'todo',
//   state: {
//     todos: [],
//   },
//   getters: TodoGetters,
//   mutations: TodoMutations,
//   actions: TodoActions,
// });

export const todo = vuexTsBuilder<TodoState, any>({
  name: 'todo',
  state: {
    todos: [],
  },
}).inject({
  getters: TodoGetters,
  mutations: TodoMutations,
  actions: TodoActions,
  modules: TodoChildren,
});
