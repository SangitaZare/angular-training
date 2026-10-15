import { ProjectsState } from './projects.reducer';
import {
  selectActiveCount,
  selectAllProjects,
  selectCompletedCount,
  selectOnHoldCount,
  selectProjectsError,
  selectProjectsLoading,
  selectTotalCount,
} from './projects.selectors';

describe('projects selectors', () => {
  const state: { projects: ProjectsState } = {
    projects: {
      loading: false,
      loaded: true,
      error: null,
      projects: [
        { id: '1', name: 'A', owner: 'Maya', status: 'active', updatedAt: '2026-09-01' },
        { id: '2', name: 'B', owner: 'Jordan', status: 'completed', updatedAt: '2026-09-02' },
        { id: '3', name: 'C', owner: 'Priya', status: 'on-hold', updatedAt: '2026-09-03' },
        { id: '4', name: 'D', owner: 'Sam', status: 'active', updatedAt: '2026-09-04' },
      ],
    },
  };

  it('selectAllProjects returns every project', () => {
    expect(selectAllProjects(state)).toHaveLength(4);
  });

  it('selectProjectsLoading / selectProjectsError read the flat flags', () => {
    expect(selectProjectsLoading(state)).toBe(false);
    expect(selectProjectsError(state)).toBeNull();
  });

  it('selectTotalCount counts every project', () => {
    expect(selectTotalCount(state)).toBe(4);
  });

  it('selectActiveCount / selectCompletedCount / selectOnHoldCount partition by status', () => {
    expect(selectActiveCount(state)).toBe(2);
    expect(selectCompletedCount(state)).toBe(1);
    expect(selectOnHoldCount(state)).toBe(1);
  });
});
