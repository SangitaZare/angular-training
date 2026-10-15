import { createReducer, on } from '@ngrx/store';
import { Project } from './project.model';
import * as ProjectsActions from './projects.actions';

export interface ProjectsState {
  projects: Project[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const initialState: ProjectsState = {
  projects: [],
  loading: false,
  loaded: false,
  error: null,
};

/**
 * The reducer is the only place state actually changes, and it does so
 * with a pure function: (current state, action) -> new state object. The
 * HTTP call that produces loadProjectsSuccess/Failure lives in
 * projects.effects.ts instead, which is what keeps this trivial to unit
 * test and safe to replay/time-travel in the Redux DevTools.
 */
export const projectsReducer = createReducer(
  initialState,

  on(ProjectsActions.loadProjects, (state): ProjectsState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(ProjectsActions.loadProjectsSuccess, (state, { projects }): ProjectsState => ({
    ...state,
    projects,
    loading: false,
    loaded: true,
  })),

  on(ProjectsActions.loadProjectsFailure, (state, { message }): ProjectsState => ({
    ...state,
    loading: false,
    error: message,
  })),

  on(ProjectsActions.toggleProjectStatus, (state, { id }): ProjectsState => ({
    ...state,
    projects: state.projects.map((project) =>
      project.id === id
        ? { ...project, status: project.status === 'active' ? 'completed' : 'active' }
        : project,
    ),
  })),

  on(ProjectsActions.removeProject, (state, { id }): ProjectsState => ({
    ...state,
    projects: state.projects.filter((project) => project.id !== id),
  })),
);
