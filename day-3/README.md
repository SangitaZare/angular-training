# Day 3: Angular Services and Dependency Injection

An Angular app (NgModule-based, generated with Angular CLI 21) built to cover
the Day 3 curriculum: services, dependency injection, and `HttpClient`. It
fetches posts from [JSONPlaceholder](https://jsonplaceholder.typicode.com), a
free mock REST API, and displays them with loading/error handling.

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
| Service that fetches from a public API | [src/app/services/post.ts](src/app/services/post.ts) — `PostService`, calls `https://jsonplaceholder.typicode.com/posts` |
| Dependency injection | `PostService` is `@Injectable({ providedIn: 'root' })` and is constructor-injected into [post-list.ts](src/app/components/post-list/post-list.ts) — see below |
| `HttpClient` registration | [app-module.ts](src/app/app-module.ts) — `provideHttpClient()` in the `providers` array |
| Display data + error handling | [post-list.ts](src/app/components/post-list/post-list.ts) / [post-list.html](src/app/components/post-list/post-list.html) — loading, error, and success states, plus a retry button |

All components and the service have unit tests in matching `*.spec.ts` files
(13 tests, run with `ng test`). The service tests use `HttpTestingController`
to mock the HTTP layer (no real network calls in tests); the component tests
mock `PostService` itself to isolate the component's own logic.

> **Why `PostList`'s state is signals, not plain fields.** This project (like
> any app scaffolded by Angular CLI 21) has no `zone.js` — Angular is
> zoneless by default now. Without Zone.js patching async APIs, nothing
> automatically tells Angular to re-render after a plain `this.posts = ...`
> assignment inside an HTTP `subscribe()` callback; the state changes
> correctly, but the view can stay frozen (e.g. stuck on "Loading…") until
> some *other* event happens to trigger a check. Writing to a
> [signal](src/app/components/post-list/post-list.ts) (`.set()`) is what
> reliably notifies Angular's zoneless scheduler, regardless of what
> triggered the write. The regression test
> `should update the DOM once a genuinely async response arrives` in
> [post-list.spec.ts](src/app/components/post-list/post-list.spec.ts) exists
> specifically to catch this class of bug — it uses a `Subject` (which only
> emits when told to) instead of `of()` (which emits synchronously and would
> mask the issue), to faithfully mimic a real, later-arriving HTTP response.

---

## Concepts

**What is dependency injection in Angular, and why is it useful?**
Dependency injection (DI) means a class declares what it needs in its
constructor, and a runtime container (Angular's *injector*) is responsible
for constructing and supplying those dependencies — the class itself never
calls `new` on its dependencies. See
[post-list.ts](src/app/components/post-list/post-list.ts):

```ts
constructor(private postService: PostService) {}
```

`PostList` doesn't know or care how `PostService` is built (it needs an
`HttpClient`, which itself needs a backend, an injected list of
interceptors, etc.) — Angular's injector resolves that whole chain. This is
useful because it decouples classes from their dependencies' concrete
construction: you can substitute a different implementation (most commonly,
a mock/stub in tests — see
[post-list.spec.ts](src/app/components/post-list/post-list.spec.ts), where a
fake `PostService` is provided instead of the real one) without touching the
consuming class at all. `@Injectable({ providedIn: 'root' })` on
[PostService](src/app/services/post.ts) registers it with the app's root
injector, so Angular creates exactly one shared instance and hands that same
instance to every class that asks for it (a singleton, by default).

**How do you use `HttpClient` to fetch data from an API?**
1. Register it once, app-wide — see `provideHttpClient()` in
   [app-module.ts](src/app/app-module.ts).
2. Inject `HttpClient` into a service (never call it directly from a
   component) and call `.get<T>(url)`, which returns an `Observable<T>` —
   see `getPosts()` in [post.ts](src/app/services/post.ts).
3. `subscribe()` to that observable wherever you need the data — see
   `ngOnInit()` in [post-list.ts](src/app/components/post-list/post-list.ts).
   Nothing happens until you subscribe; an `HttpClient` observable is *cold*.

**How do you handle errors in HTTP requests?**
Two layers, both demonstrated here:
- In the *service*, pipe the request through RxJS's `catchError` to turn a
  raw `HttpErrorResponse` into a clearer error before it reaches any
  consumer — see `handleError()` in
  [post.ts](src/app/services/post.ts), which distinguishes a network failure
  (`status === 0`) from a server error response.
- In the *component*, pass an `error` callback to `subscribe()` (alongside
  `next`) to catch whatever the service throws, store a user-facing message,
  and stop the loading state — see the `subscribe({ next, error })` call in
  [post-list.ts](src/app/components/post-list/post-list.ts). The template
  then shows that message with a "Try again" button
  ([post-list.html](src/app/components/post-list/post-list.html)).

## Tasks

1. **Service to fetch data from a public API** — `PostService`
   ([post.ts](src/app/services/post.ts)) calls JSONPlaceholder's
   `/posts` endpoint via `HttpClient` and normalizes errors with
   `catchError`.
2. **Display API data in a component with error handling** — `PostList`
   ([post-list.ts](src/app/components/post-list/post-list.ts) /
   [post-list.html](src/app/components/post-list/post-list.html)) shows a
   loading message while the request is in flight, the first 10 posts once
   it succeeds, or an error message with a retry button if it fails.
