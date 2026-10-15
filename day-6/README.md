# Day 6: State Management with NgRx

An Angular app (NgModule-based, generated with Angular CLI 21) built to cover
the Day 6 curriculum: NgRx actions, reducers, selectors, effects, and state
persistence. It's a single task list — add, toggle, remove, filter, clear
completed — with the whole list managed through the NgRx store and persisted
to `localStorage`, so it survives a page reload.

## Running it

```bash
npm install      # already done
ng serve          # http://localhost:4200
ng test           # unit tests (Vitest)
ng build           # production build -> dist/
```

## Where each task lives

| Task | Files |
|---|---|
| NgRx-managed list of items | [store/tasks.actions.ts](src/app/store/tasks.actions.ts), [tasks.reducer.ts](src/app/store/tasks.reducer.ts), [tasks.selectors.ts](src/app/store/tasks.selectors.ts) — add/toggle/remove/clear-completed on a `Task[]` |
| State persisted via localStorage | [store/tasks.effects.ts](src/app/store/tasks.effects.ts) (`persistTasks$`, `loadTasks$`) + [services/tasks-storage.ts](src/app/services/tasks-storage.ts) |
| UI | [components/task-list](src/app/components/task-list/task-list.ts) — add form, All/Active/Completed filter, checkbox toggle, remove, clear completed |

All reducer, selector, effects, storage-service, and component logic has
unit tests in matching `*.spec.ts` files (22 tests, run with `ng test`).

## Concepts

**What is the purpose of actions and reducers in NgRx?**

An **action** ([tasks.actions.ts](src/app/store/tasks.actions.ts)) is just a
typed event description — `{ type: '[Tasks] Add Task', title: 'Buy milk' }`
— with no behavior attached. Dispatching one doesn't change anything by
itself.

A **reducer** ([tasks.reducer.ts](src/app/store/tasks.reducer.ts)) is the
only place state actually changes, and it's a pure function:
`(currentState, action) -> newState`. No localStorage, no HTTP, nothing
async or random (`generateId()` aside) — which is exactly what makes it
trivial to unit test with plain objects (see
[tasks.reducer.spec.ts](src/app/store/tasks.reducer.spec.ts), which never
touches Angular or the DOM) and safe for the Redux DevTools to replay.

Between the two sits the **store**: components dispatch actions, the store
runs the reducer, and components read the result back through
**selectors** ([tasks.selectors.ts](src/app/store/tasks.selectors.ts)) —
small derived-data functions like `selectActiveCount` that memoize so a
component re-renders only when the slice it actually reads has changed.

**How do you use effects to handle side effects in NgRx?**

An effect is an injectable class whose fields are streams built with
`createEffect()`, listening to the store's action stream (`Actions`) via
`ofType(...)`. It's where anything that isn't a pure state transition
belongs — localStorage here, an HTTP call in a typical app — kept out of
the reducer so reducer logic stays deterministic.

[TasksEffects](src/app/store/tasks.effects.ts) has two:

- `loadTasks$` listens for `[Tasks] Load Tasks` (dispatched once from
  [App.ngOnInit](src/app/app.ts)), reads the saved list from
  `TasksStorageService`, and **maps** it to a `Load Tasks Success` action —
  the only way the reducer ever learns about it. The effect itself never
  touches the reducer or the store's state tree directly.
- `persistTasks$` listens for any action that changes the list
  (`addTask`, `toggleTask`, `removeTask`, `clearCompleted`), reads the
  *post-reducer* state back out with `withLatestFrom(store.select(...))`,
  and writes it to `localStorage` with `tap`. It's declared with
  `{ dispatch: false }` because saving to storage isn't itself a state
  change — this effect never feeds an action back into the store, so
  without that flag NgRx would (rightly) throw, expecting every effect to
  dispatch something.

```ts
loadTasks$ = createEffect(() =>
  this.actions$.pipe(
    ofType(TasksActions.loadTasks),
    map(() => TasksActions.loadTasksSuccess({ tasks: this.storage.load() })),
  ),
);
```

Dependencies are grabbed with `inject()` rather than constructor
parameters — see the comment in `tasks.effects.ts`: the effect fields are
class fields, which are initialized before a constructor body would run,
so a constructor-injected `private actions$: Actions` wouldn't be assigned
yet when those fields try to read `this.actions$`.

**How can you persist NgRx state using localStorage?**

Two pieces, both already covered above: [TasksStorageService](src/app/services/tasks-storage.ts)
wraps `localStorage.getItem`/`setItem` behind `load()`/`save()`, catching
errors so a full quota or private-browsing restriction can't crash the
app — it just skips persisting for that session. `TasksEffects.persistTasks$`
calls `save()` after every list-changing action, and `loadTasks$` calls
`load()` once on startup to rehydrate the reducer's initial state.

This keeps the reducer itself free of any storage knowledge — it only
ever sees plain `Task[]` data, whether that data originally came from
`localStorage` or from a fresh `addTask` action. Reload the page after
adding a few tasks and they're still there; open devtools → Application →
Local Storage → `day6.tasks` to see the raw persisted JSON.

## Tasks

1. **Implement NgRx to manage a list of items** —
   [TaskList](src/app/components/task-list/task-list.ts) reads the store
   with `store.selectSignal(...)` (this app is zoneless, like the earlier
   days, so a signal read is what triggers re-render — no `async` pipe
   needed) and dispatches `addTask`/`toggleTask`/`removeTask`/`clearCompleted`.
   A local `filter` signal plus a `computed()` derive the visible subset
   (All/Active/Completed) without touching the store.
2. **Persist state using localStorage** — see `TasksEffects` and
   `TasksStorageService` above. Confirmed with a live reload check: add
   tasks, reload the page, the list is unchanged.
