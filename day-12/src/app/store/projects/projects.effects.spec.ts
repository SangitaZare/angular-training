import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, ReplaySubject } from 'rxjs';

import { Project } from './project.model';
import * as ProjectsActions from './projects.actions';
import { ProjectsEffects } from './projects.effects';

describe('ProjectsEffects', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: ProjectsEffects;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);

    TestBed.configureTestingModule({
      providers: [
        ProjectsEffects,
        provideMockActions(() => actions$),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    effects = TestBed.inject(ProjectsEffects);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loadProjects$ maps a successful GET to Load Projects Success', async () => {
    const projects: Project[] = [
      { id: '1', name: 'Dashboard Redesign', owner: 'Maya Chen', status: 'active', updatedAt: '2026-09-28' },
    ];

    actions$.next(ProjectsActions.loadProjects());
    const resultPromise = firstValueFrom(effects.loadProjects$);

    httpMock.expectOne('/api/projects').flush(projects);

    expect(await resultPromise).toEqual(ProjectsActions.loadProjectsSuccess({ projects }));
  });

  it('loadProjects$ maps a failed GET to Load Projects Failure with the server message', async () => {
    actions$.next(ProjectsActions.loadProjects());
    const resultPromise = firstValueFrom(effects.loadProjects$);

    httpMock
      .expectOne('/api/projects')
      .flush({ message: 'Missing or expired token.' }, { status: 401, statusText: 'Unauthorized' });

    expect(await resultPromise).toEqual(
      ProjectsActions.loadProjectsFailure({ message: 'Missing or expired token.' }),
    );
  });

  it('loadProjects$ falls back to a generic message when the server sends none', async () => {
    actions$.next(ProjectsActions.loadProjects());
    const resultPromise = firstValueFrom(effects.loadProjects$);

    httpMock.expectOne('/api/projects').flush(null, { status: 500, statusText: 'Server Error' });

    expect(await resultPromise).toEqual(
      ProjectsActions.loadProjectsFailure({ message: 'Could not load projects.' }),
    );
  });
});
