import { createAction, props } from '@ngrx/store';
import { Project } from './project.model';

/**
 * Actions are just typed event descriptions — dispatching one doesn't
 * change state by itself; the reducer below is what interprets it.
 */
export const loadProjects = createAction('[Projects] Load Projects');

export const loadProjectsSuccess = createAction(
  '[Projects] Load Projects Success',
  props<{ projects: Project[] }>(),
);

export const loadProjectsFailure = createAction(
  '[Projects] Load Projects Failure',
  props<{ message: string }>(),
);

export const toggleProjectStatus = createAction(
  '[Projects] Toggle Project Status',
  props<{ id: string }>(),
);

export const removeProject = createAction('[Projects] Remove Project', props<{ id: string }>());
