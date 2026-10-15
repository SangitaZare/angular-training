# Day 2: Angular Templates and Pipes

An Angular app (NgModule-based, generated with Angular CLI 21) built to cover
the Day 2 curriculum: template syntax, structural directives, and custom
pipes. It's a searchable student list with a per-row details toggle.

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
| Interpolation / property / event binding | [header.html](src/app/components/header/header.html) (interpolation), [student-list.html](src/app/components/student-list/student-list.html) (`[value]`, `(input)`, `(click)`) |
| `*ngFor` / `*ngIf` | [student-list.html](src/app/components/student-list/student-list.html) — dynamic list, empty-state message, and a per-row details toggle |
| Custom pipes | [capitalize-pipe.ts](src/app/pipes/capitalize-pipe.ts), [filter-by-name-pipe.ts](src/app/pipes/filter-by-name-pipe.ts) |

All components and both pipes have unit tests in matching `*.spec.ts` files
(21 tests, run with `ng test`).

> This project intentionally sticks to Day 2 topics only — no `ngModel` or
> custom directives here (see the [`day-1`](../day-1/) project for those).
> The search box uses plain `(input)` event binding + `[value]` property
> binding instead of `[(ngModel)]`, to stay in scope and avoid needing
> `FormsModule`.
>
> Also note: `*ngIf`/`*ngFor` (the classic structural directives named in the
> curriculum) are used throughout. Angular 17+ also offers a newer built-in
> control-flow syntax (`@if`, `@for`) that's now preferred for new code, but
> `*ngIf`/`*ngFor` still work and are what's demonstrated here.

---

## Concepts

**Property binding vs. interpolation**
Interpolation `{{ expr }}` only works for rendering text content inside a
template (it's converted to a string). Property binding `[prop]="expr"` sets
an actual DOM/component property and accepts any type — booleans, objects,
arrays — not just strings, e.g. `[value]="searchTerm"` or `[students]`
(an array) in [app.html](src/app/app.html). `{{ x }}` is really shorthand
that Angular compiles down to a property binding on `textContent` anyway, so
the two are closely related, but only property binding lets you set
non-string properties.

**How does `*ngFor` optimize rendering?**
By default Angular re-renders a list by identity comparison on each item;
`trackBy` lets you give it a stable id so it only creates/destroys/moves the
DOM nodes that actually changed instead of tearing down and rebuilding the
whole list on every change-detection cycle. See `trackById` in
[student-list.ts](src/app/components/student-list/student-list.ts) and its
use in [student-list.html](src/app/components/student-list/student-list.html)
(`trackBy: trackById`) — without it, retyping a search filter would destroy
and recreate every `<li>` instead of reusing the ones still matching.

**How do you create a custom pipe, and when would you use it?**
Decorate a class with `@Pipe({ name: 'x' })` and implement `PipeTransform`'s
`transform()` method. Use a pipe whenever you need to reformat data for
display without mutating the underlying model — formatting is view-only logic
that doesn't belong in the component class or the source data. This project
has two:
- [capitalize-pipe.ts](src/app/pipes/capitalize-pipe.ts) — title-cases text
  (`{{ student.name | capitalize }}`).
- [filter-by-name-pipe.ts](src/app/pipes/filter-by-name-pipe.ts) — filters the
  student array by a search term (`students | filterByName: searchTerm`),
  showing a pipe can transform more than just strings.

## Tasks

1. **Dynamic list with `*ngFor` + conditional rendering with `*ngIf`** —
   [student-list.html](src/app/components/student-list/student-list.html)
   renders one row per student with `*ngFor`, shows an empty-state message
   with `*ngIf` when a search matches nothing, and has a second, independent
   `*ngIf` per row (a "Details" button toggles an email line via component
   state). The filtered result is captured once via `*ngIf="... as filtered"`
   so the `filterByName` pipe isn't invoked twice per render.
2. **Custom pipe to format text** — `capitalize` (title-cases names/courses)
   and `filterByName` (search filter), both above.
