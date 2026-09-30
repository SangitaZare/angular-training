# Day 1: Angular Architecture and Components

An Angular app (NgModule-based, generated with Angular CLI 21) built to cover the
Day 1 curriculum: component-based architecture, data binding, and custom
directives. It's a small student sign-up form that shows the most recently
submitted entry.

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
| Multiple components | [src/app/components/](src/app/components/) — `header`, `footer`, `student-form`, `student-card`, composed in [app.html](src/app/app.html) |
| NgModule | [src/app/app-module.ts](src/app/app-module.ts) — declares every component/directive, imports `BrowserModule` + `FormsModule` |
| Two-way binding (`ngModel`) | [student-form.html](src/app/components/student-form/student-form.html) — name/email/course inputs |
| Custom directive (highlight on hover) | [src/app/directives/highlight.ts](src/app/directives/highlight.ts) — `appHighlight`, applied to the form's inputs and the student card |

All components and the directive have unit tests in matching `*.spec.ts` files
(18 tests, run with `ng test`).

> This project intentionally sticks to Day 1 topics only — no `*ngIf`/`*ngFor`
> or custom pipes here (see the [`day-2`](../day-2/) project for those). The
> "last submitted student" card uses plain interpolation with a `||` fallback
> instead of a structural directive, to stay in scope.

---

## Concepts

**What is the purpose of an Angular module (`NgModule`)?**
An `NgModule` is a container that groups related components, directives, and
pipes together and declares what they need to work: other modules to import
(e.g. `FormsModule` for `ngModel`), services to provide, and — for the root
module — which component to bootstrap. See [app-module.ts](src/app/app-module.ts):
it declares every component/directive in this app and imports `BrowserModule`
(runs the app in a browser) and `FormsModule` (enables `ngModel`). Without a
module (or, in newer standalone-component style, an equivalent list of
imports on the component itself), Angular wouldn't know a directive like
`appHighlight` is available inside a given template.

**One-way vs. two-way data binding**
- *One-way* binding flows data in a single direction. Property binding
  `[title]="title"` (parent → child, see [app.html](src/app/app.html)) and
  interpolation `{{ title }}` (component → view, see
  [header.html](src/app/components/header/header.html)) are one-way. Event
  binding `(addStudent)="onAddStudent($event)"` is also one-way, just in the
  opposite direction (view → component).
- *Two-way* binding synchronizes a value in both directions at once:
  `[(ngModel)]="name"` in [student-form.html](src/app/components/student-form/student-form.html)
  means typing in the input updates `name` on the component, **and** any
  programmatic change to `name` updates the input's displayed value. It's
  syntactic sugar over `[ngModel]="name" (ngModelChange)="name = $event"`.

**How do you create a custom directive in Angular?**
Decorate a class with `@Directive({ selector: '[appHighlight]' })`, inject
`ElementRef`/`Renderer2` to touch the host element safely, and use
`@HostListener` to react to DOM events. See
[highlight.ts](src/app/directives/highlight.ts): it listens for `mouseenter`/
`mouseleave` and uses `Renderer2.setStyle` to swap the background color,
with an `@Input() highlightColor` so consumers can customize it
(`<p appHighlight highlightColor="orange">`).

## Tasks

1. **Angular project with multiple components** — `Header`, `Footer`,
   `StudentForm`, and `StudentCard`, composed inside the root `App` component
   ([app.html](src/app/app.html)).
2. **Form with two-way binding (`ngModel`)** — the "Add Student" form
   ([student-form.html](src/app/components/student-form/student-form.html)) binds
   `name`, `email`, and `course` with `[(ngModel)]`, with a live preview line
   that updates as you type.
3. **Custom directive: highlight on hover** — `appHighlight`
   ([highlight.ts](src/app/directives/highlight.ts)), applied to the form's
   inputs and the student-card preview.
