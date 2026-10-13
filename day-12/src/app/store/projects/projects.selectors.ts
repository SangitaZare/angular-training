import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectsState } from './projects.reducer';

export const selectProjectsState = createFeatureSelector<ProjectsState>('projects');

export const selectAllProjects = createSelector(selectProjectsState, (state) => state.projects);

export const selectProjectsLoading = createSelector(selectProjectsState, (state) => state.loading);

export const selectProjectsError = createSelector(selectProjectsState, (state) => state.error);

export const selectTotalCount = createSelector(selectAllProjects, (projects) => projects.length);

export const selectActiveCount = createSelector(
  selectAllProjects,
  (projects) => projects.filter((project) => project.status === 'active').length,
);

export const selectCompletedCount = createSelector(
  selectAllProjects,
  (projects) => projects.filter((project) => project.status === 'completed').length,
);

export const selectOnHoldCount = createSelector(
  selectAllProjects,
  (projects) => projects.filter((project) => project.status === 'on-hold').length,
);
