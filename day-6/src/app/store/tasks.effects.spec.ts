import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, ReplaySubject } from 'rxjs';

import { Task } from '../models/task.model';
import { TasksStorageService } from '../services/tasks-storage';
import * as TasksActions from './tasks.actions';
import { TasksEffects } from './tasks.effects';
import { selectAllTasks } from './tasks.selectors';

describe('TasksEffects', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: TasksEffects;
  let store: MockStore;
  let storage: { load: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    storage = { load: vi.fn(), save: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        TasksEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { tasks: { tasks: [], loaded: false } } }),
        { provide: TasksStorageService, useValue: storage },
      ],
    });

    effects = TestBed.inject(TasksEffects);
    store = TestBed.inject(MockStore);
  });

  it('loadTasks$ maps Load Tasks to Load Tasks Success with whatever storage returns', async () => {
    const tasks: Task[] = [{ id: '1', title: 'Buy milk', completed: false }];
    storage.load.mockReturnValue(tasks);

    actions$.next(TasksActions.loadTasks());

    const result = await firstValueFrom(effects.loadTasks$);
    expect(result).toEqual(TasksActions.loadTasksSuccess({ tasks }));
  });

  it('persistTasks$ saves the current task list to storage without dispatching', async () => {
    const tasks: Task[] = [{ id: '1', title: 'Buy milk', completed: true }];
    store.overrideSelector(selectAllTasks, tasks);

    actions$.next(TasksActions.toggleTask({ id: '1' }));

    await firstValueFrom(effects.persistTasks$);
    expect(storage.save).toHaveBeenCalledWith(tasks);
  });
});
