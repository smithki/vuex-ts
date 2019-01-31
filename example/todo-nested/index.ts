import { VuexTsModule } from '../../src';
import { vuexTsBuilder } from '../../src/typed-module';
import { TodoActions } from './todo.actions';
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

export const todoNested = vuexTsBuilder<TodoState, any>({
  name: 'todo-nested',
  state: {
    todos: [],
  },
}).inject({
  getters: TodoGetters,
  mutations: TodoMutations,
  actions: TodoActions,
});
