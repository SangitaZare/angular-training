import { Project } from './project.model';
import * as ProjectsActions from './projects.actions';
import { initialState, projectsReducer, ProjectsState } from './projects.reducer';

const seeded: ProjectsState = {
  loading: false,
  loaded: true,
  error: null,
  projects: [
    { id: '1', name: 'Dashboard Redesign', owner: 'Maya Chen', status: 'active', updatedAt: '2026-09-28' },
    { id: '2', name: 'Mobile Onboarding', owner: 'Priya Patel', status: 'completed', updatedAt: '2026-09-18' },
  ],
};

describe('projectsReducer', () => {
  it('returns the initial state for an unknown action', () => {
    const state = projectsReducer(undefined, { type: '[Test] Unknown' });
    expect(state).toEqual(initialState);
  });

  it('sets loading and clears any previous error on Load Projects', () => {
    const state = projectsReducer(
      { ...initialState, error: 'previous failure' },
      ProjectsActions.loadProjects(),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores the list and marks loaded on Load Projects Success', () => {
    const projects: Project[] = seeded.projects;
    const state = projectsReducer(
      { ...initialState, loading: true },
      ProjectsActions.loadProjectsSuccess({ projects }),
    );
    expect(state).toEqual({ ...initialState, projects, loaded: true, loading: false });
  });

  it('stores the error message and stops loading on Load Projects Failure', () => {
    const state = projectsReducer(
      { ...initialState, loading: true },
      ProjectsActions.loadProjectsFailure({ message: 'Network error' }),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('flips active to completed and back on Toggle Project Status', () => {
    const toggled = projectsReducer(seeded, ProjectsActions.toggleProjectStatus({ id: '1' }));
    expect(toggled.projects[0].status).toBe('completed');

    const toggledBack = projectsReducer(toggled, ProjectsActions.toggleProjectStatus({ id: '1' }));
    expect(toggledBack.projects[0].status).toBe('active');
  });

  it('leaves other projects untouched on Toggle Project Status', () => {
    const state = projectsReducer(seeded, ProjectsActions.toggleProjectStatus({ id: '1' }));
    expect(state.projects[1]).toEqual(seeded.projects[1]);
  });

  it('removes only the matching project on Remove Project', () => {
    const state = projectsReducer(seeded, ProjectsActions.removeProject({ id: '1' }));
    expect(state.projects).toEqual([seeded.projects[1]]);
  });
});
