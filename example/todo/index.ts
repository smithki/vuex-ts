import { VuexTsModule } from '../../src';
import { TodoActions } from './todo.actions';
import { TodoGetters } from './todo.getters';
import { TodoState } from './todo.model';
import { TodoMutations } from './todo.mutations';

export const todo = new VuexTsModule<TodoState, any, TodoGetters, TodoMutations, TodoActions>({
  name: 'todo',
  state: {
    todos: [],
  },
  getters: TodoGetters,
  mutations: TodoMutations,
  actions: TodoActions,
});
