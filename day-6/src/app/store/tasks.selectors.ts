import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState } from './tasks.reducer';

export const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectTasksLoaded = createSelector(selectTasksState, (state) => state.loaded);

export const selectAllTasks = createSelector(selectTasksState, (state) => state.tasks);

export const selectActiveTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => !task.completed),
);

export const selectCompletedTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.completed),
);

export const selectActiveCount = createSelector(selectActiveTasks, (tasks) => tasks.length);

export const selectCompletedCount = createSelector(selectCompletedTasks, (tasks) => tasks.length);
