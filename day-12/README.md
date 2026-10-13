# Day 12: Mini-Project — Angular Dashboard

An Angular app (NgModule-based, generated with Angular CLI 21, zoneless) that
pulls together the skills from the earlier days into one cohesive project: a
mock-JWT-authenticated dashboard, an NgRx-backed project list, and a QR code
generator, all built with Angular Material.

- **Authentication** — the same mock-JWT login/guard/interceptor chain as
  [Day 9](../day-9), trimmed to what this app actually needs (no role
  claim, since nothing here is role-gated).
- **State management** — an NgRx feature store (actions/reducer/selectors/
  effects), the same shape as [Day 6](../day-6)'s, loading its data over
  HTTP through the authenticated mock backend instead of `localStorage`.
- **UI** — Angular Material throughout: a responsive toolbar + sidenav shell,
  `mat-table`/`mat-chip` for the project list, `mat-card` stat tiles, and a
  Material form for both the login page and the QR generator.
- **QR code generation** — the same `qrcode`-wrapping service as
  [Day 11](../day-11), reused to turn any link (defaulted to a
  share-back-to-the-dashboard URL) into a downloadable PNG.

## Running it

```bash
npm install      # already done
ng serve          # http://localhost:4200
ng test           # unit tests (Vitest)
ng build           # production build -> dist/
```

Log in with `admin` / `admin123` or `user` / `user123`.

## How the dashboard is structured

```
AppModule
├── App (shell: mat-toolbar + responsive mat-sidenav + <router-outlet>)
├── auth/              — AuthService, guards, interceptors, mock JWT (Day 9's shape)
├── store/projects/     — NgRx actions/reducer/selectors/effects (Day 6's shape)
├── services/
│   └── qr-code.service.ts   — thin wrapper around the `qrcode` package (Day 11's shape)
└── components/
    ├── login-form/     — route: /login  (guestGuard)
    ├── dashboard/       — route: /dashboard (authGuard) — stat cards + projects table
    └── qr-share/        — route: /share (authGuard) — QR code generator
```

[App](src/app/app.ts) is deliberately thin — a toolbar, a sidenav with two
nav links, and a `<router-outlet>` — because the three graded pieces
(auth, state, QR) are each already a self-contained concern from an earlier
day; the mini-project's own job is wiring them into one shell and one
navigable app, not re-inventing any of the three.

## Where each task lives

| Task | Files |
|---|---|
| User authentication | [login-form.ts](src/app/components/login-form/login-form.ts) / [.html](src/app/components/login-form/login-form.html) (Material form) + [auth/](src/app/auth) (service, guards, interceptors, mock backend) |
| Data display | [dashboard.ts](src/app/components/dashboard/dashboard.ts) / [.html](src/app/components/dashboard/dashboard.html) — `mat-card` stat tiles + a `mat-table` of projects, both reading NgRx selectors |
| State management (NgRx) | [store/projects/](src/app/store/projects) — `projects.actions.ts` / `.reducer.ts` / `.selectors.ts` / `.effects.ts` |
| QR code generation | [qr-code.service.ts](src/app/services/qr-code.service.ts) (wraps `qrcode`'s `toCanvas`) driven by [qr-share.ts](src/app/components/qr-share/qr-share.ts) |
| Angular Material UI | Throughout — see [app-module.ts](src/app/app-module.ts)'s Material imports; toolbar/sidenav shell in [app.html](src/app/app.html) |
| Responsive layout | [app.ts](src/app/app.ts)'s `isHandset` signal (CDK `BreakpointObserver`, same pattern as [Day 7](../day-7)) switches the sidenav between `side` and `over` mode |

All services, guards, interceptors, store pieces, and components have unit
tests in matching `*.spec.ts` files (63 tests, run with `ng test`). The full
login → dashboard → toggle/remove → share → logout flow was also driven
end-to-end in a real browser with Playwright against `ng serve`, which is
how a styling bug — the status chips' color-coding silently doing nothing,
since `mat-chip` paints its background from the Material-specific
`--mat-chip-elevated-container-color` token rather than the plain
`background-color` property a class like `.status-active` would normally
set — got caught; jsdom (what `ng test` runs against) doesn't compute real
styles, so no unit test could have seen it.

## Concepts

**How did you structure the dashboard components?**

As a thin shell around three independently-testable concerns rather than one
large component. [App](src/app/app.ts) owns only navigation chrome (the
toolbar, the sidenav, which route is active); it doesn't know anything about
projects, QR codes, or how login works — it just reads
`AuthService.isAuthenticated()` to decide whether to show the sidenav and
logout button at all. [Dashboard](src/app/components/dashboard/dashboard.ts)
and [QrShare](src/app/components/qr-share/qr-share.ts) are each routed
separately (`/dashboard`, `/share`) behind `authGuard`, so neither has to
account for the other's state. This mirrors how the earlier days built each
piece in isolation — Day 12's job was composition, not redesign.

**What state management approach did you use, and why?**

NgRx, the same actions → reducer → selectors → effects shape
[Day 6](../day-6) used for its task list, now loading real (mocked) HTTP
data instead of `localStorage`:

```ts
// projects.effects.ts
loadProjects$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ProjectsActions.loadProjects),
    switchMap(() =>
      this.http.get<Project[]>('/api/projects').pipe(
        map((projects) => ProjectsActions.loadProjectsSuccess({ projects })),
        catchError((error: HttpErrorResponse) =>
          of(ProjectsActions.loadProjectsFailure({ message: error.error?.message ?? '...' })),
        ),
      ),
    ),
  ),
);
```

That `GET /api/projects` call goes through the exact same interceptor chain
as everything else in this app — `authInterceptor` attaches the JWT,
`mockBackendInterceptor` checks it and answers with the seeded project list
or a `401`. NgRx wasn't picked because this particular screen is complex
enough to need it (a signal or two would have worked for one table); it's
here because the brief asked for it, and because it's the pattern that
scales if more features started sharing this data — any future component
can read `selectAllProjects` without knowing anything fetched it over HTTP
in the first place. [Dashboard](src/app/components/dashboard/dashboard.ts)
reads it with `store.selectSignal(...)`, the same zoneless-friendly approach
Day 6's `TaskList` used, rather than the `async` pipe.

**How did you ensure the app is responsive and accessible?**

Responsive: the sidenav's `mode` and `opened` state are driven by a CDK
`BreakpointObserver` signal, not a CSS media query alone —
[app.ts](src/app/app.ts):

```ts
readonly isHandset = signal(false);

constructor() {
  this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(takeUntilDestroyed())
    .subscribe((state) => this.isHandset.set(state.matches));
}
```

```html
<mat-sidenav [mode]="isHandset() ? 'over' : 'side'" [opened]="auth.isAuthenticated() && !isHandset()">
```

On a handset-width viewport the sidenav floats over the content and starts
closed (with a toolbar menu button to open it); otherwise it sits permanently
alongside the content. The stat-card row and the login/QR cards use CSS Grid
with `repeat(auto-fit, minmax(...))` ([dashboard.css](src/app/components/dashboard/dashboard.css)),
the same technique Day 7 used, so they reflow without a second breakpoint to
maintain. The projects table sits in its own `overflow-x: auto` wrapper
rather than trying to force a `mat-table` into a narrow viewport.

Accessibility practices actually applied, not just a checklist:

- **Every icon-only button has an `aria-label`** — the sidenav toggle, the
  logout button, and each row's toggle-status/remove buttons in
  [dashboard.html](src/app/components/dashboard/dashboard.html) (the latter
  two interpolate the project's name in, e.g. `"Remove Dashboard Redesign"`,
  so a screen reader announces *which* row, not just "button").
- **Form fields have real labels.** `<mat-label>` inside `mat-form-field`
  wires up `aria-labelledby` automatically for the login and QR-text inputs;
  `mat-error` is tied to its input's `aria-describedby` the same way, so an
  invalid field's reason is announced when it receives focus.
- **Loading and error states are live regions, used narrowly.** The
  dashboard's loading spinner and the login/QR error messages use
  `role="status"` / `role="alert"` respectively — but the stat-card numbers
  and table rows underneath them do not, since re-announcing the whole table
  on every toggle would be noise, not help.
- **Real interactive elements.** Every clickable control is a native
  `<button>` or Material component built on one (`mat-list-item` links,
  `mat-icon-button`), never a styled `<div>` — keyboard-focusable and
  correctly announced by default.

## Tasks

1. **Build a dashboard with user authentication, data display, and QR code
   generation** — [login-form.ts](src/app/components/login-form/login-form.ts)
   (auth) → [dashboard.ts](src/app/components/dashboard/dashboard.ts) (data
   display, NgRx-backed) and [qr-share.ts](src/app/components/qr-share/qr-share.ts)
   (QR generation), tied together by the [App](src/app/app.ts) shell and
   route guards in [app-routing-module.ts](src/app/app-routing-module.ts).
2. **Use Angular Material for UI and NgRx for state management** — Material
   components throughout (see [app-module.ts](src/app/app-module.ts)); NgRx
   feature store in [store/projects/](src/app/store/projects), registered via
   `StoreModule.forRoot` / `EffectsModule.forRoot` in the same file.
