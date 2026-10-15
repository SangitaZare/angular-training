# Day 10: Angular Testing

An Angular app (NgModule-based, generated with Angular CLI 21, zoneless) built
to cover the Day 10 curriculum: unit testing components and services, and
mocking HTTP requests. It's a small product catalog — a list with a delete
button, and a form that adds to it — chosen because it's just complex enough
to need every testing technique the curriculum asks about: a service that
calls `HttpClient`, a component that depends on that service, and a form that
has its own validation state to exercise.

**Why Karma, when every other day in this repo uses Vitest:** `ng new`'s
default test runner since Angular 20 is Vitest, which is what days 1–9 all
use (the CLI prompts for a runner; Vitest is the default answer). Day 10's
curriculum explicitly asks "what is the role of Jasmine and Karma," so this
app was scaffolded with `--test-runner=karma` instead, which is still a fully
supported first-class option — it's real Karma running real Jasmine specs in
a real (headless) Chrome, not an approximation. `TestBed`, `HttpTestingController`,
`ComponentFixture` — everything the curriculum is actually about — work
identically either way; the only code-level difference below is spies
(`jasmine.createSpyObj` / `spyOn` here, vs. Vitest's `vi.fn()` / `vi.spyOn()`
in the other days).

## Running it

```bash
npm install      # already done
ng serve          # http://localhost:4200
ng test           # unit tests (Karma + Jasmine, headless Chrome)
ng build           # production build -> dist/
```

There's no real backend — [mockBackendInterceptor](src/app/mock-backend.interceptor.ts)
plays that part, with an in-memory product list and a simulated 300ms
latency — so `ng serve` is fully interactive: load the page, add a product,
remove one, refresh.

## Where each task lives

| Task | Files |
|---|---|
| Unit tests for a service | [product.service.spec.ts](src/app/services/product.service.spec.ts) tests [product.service.ts](src/app/services/product.service.ts) |
| Unit tests for a component | [product-list.spec.ts](src/app/components/product-list/product-list.spec.ts) tests [product-list.ts](src/app/components/product-list/product-list.ts) (list + delete); [product-form.spec.ts](src/app/components/product-form/product-form.spec.ts) tests [product-form.ts](src/app/components/product-form/product-form.ts) (form + validation) |
| Mocking an HTTP service for API calls | `HttpTestingController` in [product.service.spec.ts](src/app/services/product.service.spec.ts) (mocks the network itself); `jasmine.createSpyObj` in [product-list.spec.ts](src/app/components/product-list/product-list.spec.ts) and `spyOn` in [product-form.spec.ts](src/app/components/product-form/product-form.spec.ts) (mock the service instead, so the component tests don't need HTTP at all) |

Supporting pieces: [Product](src/app/models/product.ts) (the shared model),
[mock-backend.interceptor.ts](src/app/mock-backend.interceptor.ts) (the fake
server, itself covered by [mock-backend.interceptor.spec.ts](src/app/mock-backend.interceptor.spec.ts)),
and [App](src/app/app.ts) (wires the form and list together, tested in
[app.spec.ts](src/app/app.spec.ts)). All 22 tests run with `ng test`.

## Concepts

**What is the role of Jasmine and Karma in Angular testing?**

They're two different layers, and it's easy to conflate them. **Jasmine** is
the *testing framework* — it's where `describe`, `it`, `expect`, and
`jasmine.createSpyObj` come from. It defines how you write a test and what
"this test passed" means; it has no idea what a browser is. **Karma** is the
*test runner* — it's the thing that takes the Jasmine specs the Angular CLI
compiles, launches a real browser (here, headless Chrome — see
`CHROME_BIN` / `--browsers=ChromeHeadless` in how this project runs its
tests), injects the compiled specs into a page in that browser, and reports
back which ones passed. You could swap Karma for a different runner without
touching a single `describe` block, which is exactly what days 1–9 of this
repo do with Vitest.

```ts
// product.service.spec.ts — this whole file is Jasmine; Karma just decides
// *where* it runs (a real browser) and streams the pass/fail back.
describe('ProductService', () => {
  it('fetches the product list with a GET to /api/products', () => {
    /* ... */
  });
});
```

**What is the purpose of TestBed in Angular testing?**

Angular components and services don't work standing alone — a component
needs Angular's compiler to turn its template into a render function, and
both components and services get their dependencies from a DI injector, not
from a constructor you call yourself. `TestBed.configureTestingModule()`
builds a miniature Angular module just for one test, and `TestBed.inject()` /
`TestBed.createComponent()` ask *that* module's injector for an instance —
so a spec gets a real, fully-wired `ProductService` or `ProductList`, not a
plain `new ProductService()` that skips Angular's own machinery.

```ts
// product-list.spec.ts
TestBed.configureTestingModule({
  declarations: [ProductList],
  providers: [{ provide: ProductService, useValue: productServiceSpy }],
});

const fixture = TestBed.createComponent(ProductList);
fixture.detectChanges(); // runs ngOnInit, then renders the template
```

`providers` is where a test substitutes its own fake for anything the
component would otherwise get for real — in this case, a `ProductService`
that never makes an HTTP call — and `fixture.detectChanges()` is what
actually runs change detection, since `TestBed.createComponent()` by itself
only constructs the component without rendering it.

**How do you mock an HTTP service in Angular tests?**

This app answers that two different ways, deliberately, because they solve
different problems.

[product.service.spec.ts](src/app/services/product.service.spec.ts) tests
`ProductService` itself, so it has to let the service's real `HttpClient`
calls happen and intercept them at the network layer:

```ts
TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting()],
});
service = TestBed.inject(ProductService);
httpMock = TestBed.inject(HttpTestingController);

service.getProducts().subscribe((products) => (result = products));

const req = httpMock.expectOne('/api/products');
expect(req.request.method).toBe('GET');
req.flush(mockProducts); // this is what actually makes the Observable emit
```

`provideHttpClientTesting()` swaps in a fake `HttpBackend` that never touches
the network; `HttpTestingController` lets a test assert exactly which
requests went out and control exactly what comes back, including error
responses (`req.flush('Server error', { status: 500, ... })`). `afterEach`
calling `httpMock.verify()` is what catches a request the code fired but the
test forgot to expect — without it, an untested request just silently
succeeds or fails with no signal.

[product-list.spec.ts](src/app/components/product-list/product-list.spec.ts)
tests `ProductList`, which doesn't call `HttpClient` directly — it calls
`ProductService`. Going through `HttpTestingController` here would mean the
test has to know `ProductService`'s implementation detail of which URL it
hits, just to test a component that doesn't care. Instead it replaces the
whole service:

```ts
productService = jasmine.createSpyObj<ProductService>('ProductService', [
  'getProducts',
  'deleteProduct',
]);
productService.getProducts.and.returnValue(of(sampleProducts));
```

`jasmine.createSpyObj` builds an object with the service's method names as
spies, so the test controls return values directly (`of(...)` for success,
`throwError(() => ...)` for failure) with no HTTP, no latency, and no
coupling to how `ProductService` happens to be implemented.
[product-form.spec.ts](src/app/components/product-form/product-form.spec.ts)
shows a third variant — `spyOn(productService, 'addProduct')` — which
replaces one method on the *real*, DI-provided service instance instead of
faking the whole thing; useful when a test only needs to control one call
and would rather leave everything else alone.

## Tasks

1. **Write unit tests for a component and a service** —
   [product.service.spec.ts](src/app/services/product.service.spec.ts) (4
   tests: GET, a propagated server error, POST, DELETE) and
   [product-list.spec.ts](src/app/components/product-list/product-list.spec.ts)
   (7 tests: loading state, rendering, load error, empty state, refresh,
   delete success, delete failure) plus
   [product-form.spec.ts](src/app/components/product-form/product-form.spec.ts)
   (5 tests: submit-button validation, the exact payload sent, the emitted
   `added` event and form reset, and the error path).
2. **Mock an HTTP service for testing API calls** — see the "How do you mock
   an HTTP service" section above: `HttpTestingController` for
   `ProductService` itself, and a Jasmine spy standing in for `ProductService`
   wherever a *consumer* of it is under test instead.
