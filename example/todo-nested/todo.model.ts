export interface TodoState {
  todos: TodoItem[];
}

export interface TodoItem {
  completed: boolean;
  description: string;
}

export const initialTodoState: TodoState = {
  todos: [],
};
