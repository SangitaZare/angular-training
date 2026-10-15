import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { Project } from './project.model';
import * as ProjectsActions from './projects.actions';

/**
 * Effects are where NgRx talks to the outside world — the HTTP call stays
 * out of the reducer so reducer logic remains a pure, deterministic
 * function. The GET below goes through authInterceptor (attaches the JWT)
 * and mockBackendInterceptor (stands in for a real server) exactly like any
 * other request this app makes, so a 401 here is handled the same way one
 * would be anywhere else — see auth.interceptor.ts.
 */
@Injectable()
export class ProjectsEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);

  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectsActions.loadProjects),
      switchMap(() =>
        this.http.get<Project[]>('/api/projects').pipe(
          map((projects) => ProjectsActions.loadProjectsSuccess({ projects })),
          catchError((error: HttpErrorResponse) =>
            of(
              ProjectsActions.loadProjectsFailure({
                message: error.error?.message ?? 'Could not load projects.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
