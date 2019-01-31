import { ModuleGetters, rootState, state } from '../../src';
import { TodoState } from './todo.model';

export class TodoGetters extends ModuleGetters<TodoState, any> {
  get mostRecentTodo() {
    return this[state].todos[this[state].todos.length - 1];
  }

  getTodoMatchingDescription(searchTerm: string) {
    return this[state].todos.filter(t => t.description === searchTerm);
  }
}
