import { ModuleChildren } from '../../src';
import { todoNested } from '../todo-nested';

export class TodoChildren extends ModuleChildren {
  todoNested = todoNested;
}
