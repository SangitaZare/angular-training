# Day 9: Angular Authentication and Interceptors

An Angular app (NgModule-based, generated with Angular CLI 21, zoneless) built
to cover the Day 9 curriculum: JWT-based authentication, HTTP interceptors,
and role-based routing. There's no real backend — a second interceptor plays
that part — but every other piece (the login form, the token storage, the
interceptor that attaches it, the route guards) is exactly what talks to a
real one.

- **Login** against a mock JWT API (two demo accounts: `admin`/`admin123`,
  `user`/`user123`), with the returned token decoded and stored.
- **`authInterceptor`** attaches `Authorization: Bearer <token>` to every
  request this app makes to its own API, and logs the user out automatically
  if one ever comes back `401`.
- **Route guards** (`authGuard`, `roleGuard`, `guestGuard`) gate navigation by
  login state and role — try visiting `/admin` as `user`.

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
| Login form against a mock JWT API | [login-form.ts](src/app/components/login-form/login-form.ts) / [.html](src/app/components/login-form/login-form.html) (form) + [mock-backend.interceptor.ts](src/app/auth/mock-backend.interceptor.ts) (the "API") |
| Interceptor that attaches JWT tokens | [auth.interceptor.ts](src/app/auth/auth.interceptor.ts) |
| Role-based routing | [app-routing-module.ts](src/app/app-routing-module.ts) (route config) + [auth.guard.ts](src/app/auth/auth.guard.ts) / [role.guard.ts](src/app/auth/role.guard.ts) / [guest.guard.ts](src/app/auth/guest.guard.ts) |

Supporting pieces: [auth.service.ts](src/app/auth/auth.service.ts) (the one
place token storage and the current-user state live), [jwt.ts](src/app/auth/jwt.ts)
(encode/decode, no real backend to do it for us), and the two protected pages
that prove the whole chain works — [dashboard.ts](src/app/components/dashboard/dashboard.ts)
(any logged-in user) and [admin-panel.ts](src/app/components/admin-panel/admin-panel.ts)
(admin only). All of it has unit tests in matching `*.spec.ts` files (48
tests, run with `ng test`); the full login → protected-request → role-gated
navigation flow was also driven end-to-end in a real browser with Playwright
against `ng serve`.

## Concepts

**How do you store and manage JWT tokens in Angular?**

[AuthService](src/app/auth/auth.service.ts) stores exactly one thing — the
raw token string, in `sessionStorage` — and derives everything else from it
on demand:

```ts
login(username: string, password: string): Observable<CurrentUser> {
  return this.http.post<{ token: string }>('/api/auth/login', { username, password }).pipe(
    map(({ token }) => {
      const payload = decodeJwt(token);
      sessionStorage.setItem(TOKEN_KEY, token);
      const user: CurrentUser = { username: payload.sub, role: payload.role };
      this._currentUser.set(user);
      return user;
    }),
  );
}
```

`currentUser` is a signal, not something re-read from storage on every
template access, so the UI reacts the normal Angular way; storage is only
there so the session survives a page reload (`AuthService`'s constructor
calls `restoreFromStorage()`, decoding whatever token is already sitting in
`sessionStorage` and discarding it if it's expired). `getToken()` re-checks
expiry on every call and self-logs-out if the token has lapsed, so nothing
else in the app has to remember to check.

*Why `sessionStorage` and not `localStorage`, and what this demo doesn't
claim to solve:* either one is readable by any JavaScript running on the
page, which means an XSS vulnerability anywhere in the app (or a compromised
dependency) can steal the token just as easily as `AuthService` reads it —
that's the real, well-known weakness of storing a JWT in web storage at all.
`sessionStorage` at least limits the blast radius to the current tab and
clears itself when the tab closes; `localStorage` persists across tabs and
restarts, which is more convenient and more exposed. The production-grade
fix — an `httpOnly` refresh-token cookie the browser attaches automatically
and JavaScript can never read, with only a short-lived access token held in
memory — needs a real backend issuing and rotating that cookie, which is
exactly the part this mock API can't provide. Worth knowing the gap exists
rather than assuming this demo's storage choice is production-ready.

**What is the role of an HTTP interceptor?**

[authInterceptor](src/app/auth/auth.interceptor.ts) sits between every
`HttpClient` call this app makes and the network, doing two things no
individual component should have to repeat: attaching the token, and
reacting uniformly when the server says that token's no good.

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = /* ...only for our own API, never the login call itself */;
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
```

Neither [Dashboard](src/app/components/dashboard/dashboard.ts) nor
[AdminPanel](src/app/components/admin-panel/admin-panel.ts) know the word
"token" exists — they just call `this.http.get('/api/profile')` like it's
any other request. That's the point: cross-cutting concerns (auth headers,
retry, logging, global error handling) belong in one interceptor that every
request passes through, not copy-pasted into every service that calls
`HttpClient`.

[mockBackendInterceptor](src/app/auth/mock-backend.interceptor.ts) is the
other half of this app's interceptor chain, registered *after*
`authInterceptor` in `provideHttpClient(withInterceptors([authInterceptor,
mockBackendInterceptor]))` — interceptors run in array order on the way out,
so the token gets attached before this one inspects the request and answers
it directly instead of calling `next()`. It only exists because there's no
real server for this exercise; deleting it (and pointing `AuthService`/the
pages at a real API) is the only change swapping in a real backend would
need.

**How do you implement role-based navigation?**

The route config carries the restriction as data, not as a guard hard-coded
per role:

```ts
const routes: Routes = [
  { path: 'login', component: LoginForm, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  {
    path: 'admin',
    component: AdminPanel,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
];
```

[roleGuard](src/app/auth/role.guard.ts) reads `route.data['roles']` and
checks it against `AuthService.hasRole()` — one guard function serves every
role-restricted route in the app, present or future, rather than needing an
`adminGuard`, an `editorGuard`, and so on. It's paired with `authGuard` on
the same route rather than folding login-checking into it, since "is anyone
logged in" and "does this logged-in user have the right role" are different
questions with different fallbacks ([authGuard](src/app/auth/auth.guard.ts)
redirects to `/login` with a `returnUrl`; `roleGuard` redirects to
`/dashboard`, since by the time it runs someone is already logged in — just
not as the right role). [guestGuard](src/app/auth/guest.guard.ts) is the
mirror case: it keeps an already-logged-in user off `/login` instead of
showing it to them again.

The same role check also happens a second time, independently, in
[mockBackendInterceptor](src/app/auth/mock-backend.interceptor.ts)'s
`/api/admin/stats` handler (`403` for a non-admin token). That's not
redundant — `roleGuard` only controls what the Angular *router* shows; it
does nothing to stop a non-admin user from calling the API endpoint directly
(devtools, curl, a modified request). Role-based routing is a UI nicety;
the API has to enforce the same rule independently to actually be secure.

## Tasks

1. **Build a login form that integrates with a mock JWT API** —
   [LoginForm](src/app/components/login-form/login-form.ts) posts credentials
   to `/api/auth/login`, which [mockBackendInterceptor](src/app/auth/mock-backend.interceptor.ts)
   answers with a JWT-shaped token (or a `401`) instead of a real server.
2. **Create an interceptor to attach JWT tokens to HTTP requests** —
   [authInterceptor](src/app/auth/auth.interceptor.ts), registered via
   `provideHttpClient(withInterceptors([...]))` in [app-module.ts](src/app/app-module.ts).
