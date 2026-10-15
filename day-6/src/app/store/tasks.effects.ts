import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, tap, withLatestFrom } from 'rxjs';
import { TasksStorageService } from '../services/tasks-storage';
import * as TasksActions from './tasks.actions';
import { selectAllTasks } from './tasks.selectors';

/**
 * Effects are where NgRx talks to the outside world — anything that
 * isn't a pure state transition (localStorage here; an HTTP call in a
 * real app) stays out of the reducer and lives here instead, so reducer
 * logic remains deterministic and trivially testable.
 *
 * Dependencies are grabbed with inject() rather than constructor
 * parameters: the loadTasks$/persistTasks$ fields below are initialized
 * as class fields, which run before a constructor body would — a
 * constructor-injected `private actions$: Actions` wouldn't be assigned
 * yet when those fields read `this.actions$`.
 */
@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly storage = inject(TasksStorageService);

  // Dispatched once on app start (see App.ngOnInit). Reads the saved list
  // from localStorage and turns it into the Load Tasks Success action —
  // the reducer never touches localStorage directly, it just reacts to
  // the plain data this effect hands it.
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      map(() => TasksActions.loadTasksSuccess({ tasks: this.storage.load() })),
    ),
  );

  // Any action that changes the task list re-saves the *current* state to
  // localStorage. withLatestFrom reads the store after the reducer has
  // already applied the action, so it always persists the post-update
  // list. { dispatch: false } because persisting isn't itself a state
  // change — this effect never feeds an action back into the store.
  persistTasks$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          TasksActions.addTask,
          TasksActions.toggleTask,
          TasksActions.removeTask,
          TasksActions.clearCompleted,
        ),
        withLatestFrom(this.store.select(selectAllTasks)),
        tap(([, tasks]) => this.storage.save(tasks)),
      ),
    { dispatch: false },
  );
}
