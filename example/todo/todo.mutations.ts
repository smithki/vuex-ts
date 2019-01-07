import { ModuleMutations, state } from '../../src';
import { TodoItem, TodoState } from './todo.model';

export class TodoMutations extends ModuleMutations<TodoState> {
  addTodoItem(payload?: TodoItem) {
    this[state].todos.push(payload);
  }
}
