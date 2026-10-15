import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Dashboard } from './dashboard';
import { Project } from '../../store/projects/project.model';
import * as ProjectsActions from '../../store/projects/projects.actions';
import {
  selectActiveCount,
  selectAllProjects,
  selectCompletedCount,
  selectOnHoldCount,
  selectProjectsError,
  selectProjectsLoading,
  selectTotalCount,
} from '../../store/projects/projects.selectors';
import { AuthService, TOKEN_KEY } from '../../auth/auth.service';
import { createMockJwt } from '../../auth/jwt';

const PROJECTS: Project[] = [
  { id: '1', name: 'Dashboard Redesign', owner: 'Maya Chen', status: 'active', updatedAt: '2026-09-28' },
  { id: '2', name: 'Mobile Onboarding', owner: 'Priya Patel', status: 'completed', updatedAt: '2026-09-18' },
];

function setup(overrides: { loading?: boolean; projects?: Project[] } = {}) {
  const projects = overrides.projects ?? PROJECTS;
  const loading = overrides.loading ?? false;

  sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 3600));

  TestBed.configureTestingModule({
    declarations: [Dashboard],
    imports: [
      NoopAnimationsModule,
      MatCardModule,
      MatTableModule,
      MatChipsModule,
      MatIconModule,
      MatButtonModule,
      MatProgressSpinnerModule,
    ],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideMockStore({
        selectors: [
          { selector: selectAllProjects, value: projects },
          { selector: selectProjectsLoading, value: loading },
          { selector: selectProjectsError, value: null },
          { selector: selectTotalCount, value: projects.length },
          { selector: selectActiveCount, value: 1 },
          { selector: selectCompletedCount, value: 1 },
          { selector: selectOnHoldCount, value: 0 },
        ],
      }),
    ],
  });

  // Reading AuthService before creating the component matches how
  // Dashboard itself injects it: its currentUser signal is derived from
  // whatever is already in sessionStorage at construction time.
  TestBed.inject(AuthService);

  const fixture: ComponentFixture<Dashboard> = TestBed.createComponent(Dashboard);
  const store = TestBed.inject(MockStore);

  return { fixture, component: fixture.componentInstance, store };
}

describe('Dashboard', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('dispatches loadProjects on init', () => {
    const { fixture, store } = setup();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(ProjectsActions.loadProjects());
  });

  it('shows the signed-in user', () => {
    const { fixture } = setup();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('admin');
  });

  it('renders a table row per project', () => {
    const { fixture } = setup();
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tr[mat-row]');
    expect(rows).toHaveLength(2);
  });

  it('dispatches toggleProjectStatus / removeProject with the right id', () => {
    const { fixture, store, component } = setup();
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.toggleStatus('1');
    expect(dispatchSpy).toHaveBeenCalledWith(ProjectsActions.toggleProjectStatus({ id: '1' }));

    component.remove('1');
    expect(dispatchSpy).toHaveBeenCalledWith(ProjectsActions.removeProject({ id: '1' }));
  });

  it('shows a loading indicator instead of the table while loading', () => {
    const { fixture } = setup({ loading: true, projects: [] });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });
});
