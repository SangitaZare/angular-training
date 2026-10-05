import { createReducer, on } from '@ngrx/store';
import { Task } from '../models/task.model';
import * as TasksActions from './tasks.actions';

export interface TasksState {
  tasks: Task[];
  loaded: boolean;
}

export const initialState: TasksState = {
  tasks: [],
  loaded: false,
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * The reducer is the only place state actually changes, and it does so
 * with a pure function: (current state, action) -> new state object. No
 * localStorage, no HTTP, no randomness beyond generating a new task's id
 * — that's what keeps it trivial to unit test (see tasks.reducer.spec.ts)
 * and safe to replay/time-travel in the Redux DevTools.
 */
export const tasksReducer = createReducer(
  initialState,

  on(TasksActions.loadTasksSuccess, (state, { tasks }): TasksState => ({
    ...state,
    tasks,
    loaded: true,
  })),

  on(TasksActions.addTask, (state, { title }): TasksState => ({
    ...state,
    tasks: [...state.tasks, { id: generateId(), title, completed: false }],
  })),

  on(TasksActions.toggleTask, (state, { id }): TasksState => ({
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task,
    ),
  })),

  on(TasksActions.removeTask, (state, { id }): TasksState => ({
    ...state,
    tasks: state.tasks.filter((task) => task.id !== id),
  })),

  on(TasksActions.clearCompleted, (state): TasksState => ({
    ...state,
    tasks: state.tasks.filter((task) => !task.completed),
  })),
);
