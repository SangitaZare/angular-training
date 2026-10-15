# Day 4: Angular Routing

An Angular app (NgModule-based, generated with Angular CLI 21) built to cover
the Day 4 curriculum: the Angular Router, route parameters, child routes,
lazy loading, and route guards. It's a small site with Home / Students /
Admin sections — Students is lazy-loaded and has a parameterized child
route per student; Admin is protected by a login guard.

## Running it

```bash
npm install      # already done
ng serve         # http://localhost:4200
ng test          # unit tests (Vitest)
ng build         # production build -> dist/
```

## Where each task lives

| Task | Files |
|---|---|
| Multiple routes | [app-routing-module.ts](src/app/app-routing-module.ts) — `''`, `'students'`, `'admin'`, `'login'`, `'**'` |
| Parameterized route | [students-routing-module.ts](src/app/students/students-routing-module.ts) — `students/:id` → [student-detail.ts](src/app/students/student-detail/student-detail.ts) |
| Child routes | Same file — `''` (list) and `':id'` (detail) nested as `children` under [students-shell.ts](src/app/students/students-shell/students-shell.ts)'s own `<router-outlet>` |
| Lazy loading | [app-routing-module.ts](src/app/app-routing-module.ts)'s `loadChildren` for the `students` path — confirmed by `ng build` showing `students-module` as a separate **lazy chunk**, not part of the initial bundle |
| Route guard | [auth-guard.ts](src/app/guards/auth-guard.ts) (`authGuard`) protects `/admin`, backed by [auth.ts](src/app/services/auth.ts) (`AuthService`) and redirecting to [login.ts](src/app/components/login/login.ts) when not logged in |

All components, the service, and the guard have unit tests in matching
`*.spec.ts` files (29 tests, run with `ng test`).

> Like Day 3, this app is zoneless (no `zone.js`). `StudentDetail` reads its
> route parameter via `route.paramMap.subscribe(...)` rather than a
> one-time `route.snapshot` read — Angular reuses the same component
> instance when you navigate from `/students/1` to `/students/2` (it's the
> same route, just a new param), so `ngOnInit` doesn't run again. The
> displayed student is held in a **signal**, for the same reason `PostList`
> in Day 3 needed one: a plain field mutated inside `subscribe()` wouldn't
> reliably trigger a re-render in a zoneless app. See the regression test
> `should update when the :id param changes without the component being
> recreated` in
> [student-detail.spec.ts](src/app/students/student-detail/student-detail.spec.ts).

---

## Concepts

**How do you configure routes with parameters?**
Put `:paramName` in a route's `path`:
```ts
{ path: ':id', component: StudentDetail }
```
Then, in the component, inject `ActivatedRoute` and read the value out of
its `paramMap` — either a one-time `route.snapshot.paramMap.get('id')`, or
(as here) `route.paramMap.subscribe(...)` if the same component can be
reused across different param values without being recreated. See
[student-detail.ts](src/app/students/student-detail/student-detail.ts).

**What is lazy loading, and how does it improve performance?**
Normally the browser downloads the code for *every* route as part of the
app's initial bundle, even pages a given user may never visit — that makes
the first load slower as the app grows. Lazy loading defers a route's code
until someone actually navigates there, via `loadChildren`:
```ts
{
  path: 'students',
  loadChildren: () => import('./students/students-module').then((m) => m.StudentsModule),
}
```
You can see it working in this project's own build output: `ng build`
prints `students-module` under a separate **"Lazy chunk files"** section,
not merged into the initial `main.js` — that chunk is only fetched the
moment a user visits `/students`.

**How do you implement a `CanActivate` guard?**
Write a function matching the `CanActivateFn` type that returns `true` to
allow the navigation, or `false` (or a redirect) to block it, then attach it
to a route's `canActivate` array:
```ts
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```
```ts
{ path: 'admin', component: Admin, canActivate: [authGuard] }
```
Angular runs the guard *before* activating `/admin`. Here it returns a
`UrlTree` (built with `router.createUrlTree`) instead of just `false`, which
redirects to `/login` and carries the originally-requested URL as a
`returnUrl` query param — [login.ts](src/app/components/login/login.ts)
reads that param and sends the user back where they were headed once they
log in. See [auth-guard.ts](src/app/guards/auth-guard.ts) and its tests in
[auth-guard.spec.ts](src/app/guards/auth-guard.spec.ts), which cover both
the allow and the redirect path.

## Tasks

1. **App with multiple routes, including a parameterized route** — five
   top-level routes in [app-routing-module.ts](src/app/app-routing-module.ts)
   (`''`, `'students'`, `'admin'`, `'login'`, `'**'`), plus the parameterized
   `students/:id` child route inside the lazy-loaded Students feature.
2. **Route guard restricting access to a route** — `authGuard`
   ([auth-guard.ts](src/app/guards/auth-guard.ts)) protects `/admin`,
   redirecting anyone not logged in to `/login` (see
   [`AuthService`](src/app/services/auth.ts) for the simulated login state —
   there's no real backend, just a signal flipped by a button, enough to
   give the guard something real to check).

There's also a small bonus beyond the two required tasks: a wildcard `**`
route ([page-not-found.ts](src/app/components/page-not-found/page-not-found.ts))
for any URL that doesn't match, since it's near-zero extra effort and is
standard practice alongside the routes above.
