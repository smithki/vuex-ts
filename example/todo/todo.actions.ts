import { context, ModuleActions, rootState, state } from '../../src';
import { todo } from './index';
import { TodoState } from './todo.model';

export class TodoActions extends ModuleActions<TodoState, any> {
  // This is where you would write more complex asynchronous handlers that
  // execute multiple mutations or fetch data from APIs.
  /*
  async someAction() {
    // some async behavior
    todo.commit.addTodoItem(...);
  }
  */
}
