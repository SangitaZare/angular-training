import { createAction, props } from '@ngrx/store';
import { Task } from '../models/task.model';

/**
 * Actions are just typed event descriptions — "a user asked to add a
 * task" — with no behavior attached. Dispatching one doesn't change
 * state by itself; the reducer below is what interprets it.
 */
export const loadTasks = createAction('[Tasks] Load Tasks');

export const loadTasksSuccess = createAction(
  '[Tasks] Load Tasks Success',
  props<{ tasks: Task[] }>(),
);

export const addTask = createAction('[Tasks] Add Task', props<{ title: string }>());

export const toggleTask = createAction('[Tasks] Toggle Task', props<{ id: string }>());

export const removeTask = createAction('[Tasks] Remove Task', props<{ id: string }>());

export const clearCompleted = createAction('[Tasks] Clear Completed');
