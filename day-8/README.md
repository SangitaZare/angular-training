# Day 8: Advanced Angular Components

An Angular app (NgModule-based, generated with Angular CLI 21, zoneless) built
to cover the Day 8 curriculum: dynamic components, `@Input`/`@Output`
component communication, and content projection. One page, two sections:

- A **dynamic widget loader** that creates a component at runtime from
  whichever type a user picks in a `<select>` — a Counter, a live Clock, or a
  Quote cycler — using `ViewContainerRef.createComponent()` instead of a
  template `@switch`.
- A **review form** — a plain parent/child pair (`ReviewForm` /
  `StarRating`) wired together with `@Input`/`@Output`, the textbook case the
  dynamic loader deliberately avoids (its children have no template binding
  site, so it has to do the `@Input`/`@Output` wiring by hand instead).

Both sections are wrapped in the same reusable `Panel` component, which
exists only to demonstrate content projection (`<ng-content>`, default and
named slots) and is otherwise just chrome.

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
| Dynamic component loaded based on user input | [dynamic-loader.ts](src/app/components/dynamic-loader/dynamic-loader.ts) / [.html](src/app/components/dynamic-loader/dynamic-loader.html) — `ViewContainerRef.createComponent()` against a registry keyed by the `<select>`'s value |
| The widgets it creates | [counter-widget](src/app/components/widgets/counter-widget/counter-widget.ts), [clock-widget](src/app/components/widgets/clock-widget/clock-widget.ts), [quote-widget](src/app/components/widgets/quote-widget/quote-widget.ts) — each a normal component with an `@Output() closed`, nothing dynamic-specific about them |
| Parent/child structure with `@Input`/`@Output` | [review-form.ts](src/app/components/review-form/review-form.ts) / [.html](src/app/components/review-form/review-form.html) (parent) and [star-rating.ts](src/app/components/star-rating/star-rating.ts) (child) |
| Content projection | [panel.ts](src/app/components/panel/panel.ts) / [.html](src/app/components/panel/panel.html) — default slot plus a named `[panel-actions]` slot, consumed by both sections above |

All components have unit tests in matching `*.spec.ts` files (28 tests, run
with `ng test`); the whole page was also driven end-to-end with Playwright
against `ng serve` to confirm it actually works, not just compiles (see
*What I actually found* below for why that mattered).

## Concepts

**How do you create a dynamic component in Angular?**

[DynamicLoader](src/app/components/dynamic-loader/dynamic-loader.ts) keeps a
small registry mapping a string key to a component class:

```ts
const WIDGET_OPTIONS: readonly WidgetOption[] = [
  { value: 'counter', label: 'Counter', component: CounterWidget },
  { value: 'clock', label: 'Clock', component: ClockWidget },
  { value: 'quote', label: 'Quote', component: QuoteWidget },
];
```

A `<ng-container #outlet></ng-container>` in the template is read as a
`ViewContainerRef` (`@ViewChild('outlet', { read: ViewContainerRef })`), and
clicking "Add widget" looks up whichever type the user selected and calls
`this.outlet.createComponent(option.component)`. `ng-container` is used
rather than a `<div>` specifically because reading a `ViewContainerRef` off a
plain element inserts new views as *siblings after* that element, not inside
it — `ng-container` renders nothing itself, so the created widgets land
exactly where they visually belong, inside `.widget-grid`.

This is the key difference from the more common `@switch`/`*ngComponentOutlet`
approach: every possible widget type doesn't need a branch written into the
template ahead of time. The component class itself is the only thing that has
to be known in advance (it still has to be declared in `AppModule`, since
NgModule-based apps need static knowledge of the type for compilation) — but
*which one* gets instantiated, and how many times, is entirely a runtime
decision driven by the `<select>`.

The harder part is what happens *after* creation: a dynamically created
component has no template binding site, so there's no `[input]="x"` or
`(output)="y()"` to write. [DynamicLoader](src/app/components/dynamic-loader/dynamic-loader.ts)
sets the one conditional input imperatively —

```ts
const ref = this.outlet.createComponent(option.component);
if (option.value === 'counter') {
  ref.setInput('step', 5);
}
```

— and reads the output by subscribing directly on the instance instead of a
template binding:

```ts
ref.instance.closed.subscribe(() => {
  ref.destroy();
  this.widgetCount.update((n) => n - 1);
});
```

**How do `@Input` and `@Output` facilitate component communication?**

[StarRating](src/app/components/star-rating/star-rating.ts) is the plain
case `@Input`/`@Output` is built for: data flows one way down
(`@Input() rating`), a user action flows back up as an event
(`@Output() ratingChange`), and the parent decides what that event means:

```ts
export class StarRating {
  @Input() rating = 0;
  @Output() ratingChange = new EventEmitter<number>();

  choose(value: number): void {
    this.rating = value;
    this.ratingChange.emit(value);
  }
}
```

[ReviewForm](src/app/components/review-form/review-form.ts) uses the *same*
child component twice for two different purposes, which is really what sells
why both directions matter independently: once editable, bound both ways —

```html
<app-star-rating [rating]="draftRating" (ratingChange)="setRating($event)"></app-star-rating>
```

— and once per submitted review, `@Input`-only with no listener at all:

```html
<app-star-rating [rating]="review.rating" [readOnly]="true"></app-star-rating>
```

Naming the output `ratingChange` to match the input `rating` is also what
would let a parent use Angular's `[(rating)]="draftRating"` banana-in-a-box
shorthand instead of writing both bindings out — not used here (the
`setRating` method needs to exist anyway for the star-click path), but worth
knowing the naming convention is what unlocks it.

The dynamic widgets reuse the exact same mechanism, just wired up in code
instead of a template — see the previous section.

**What is content projection, and how is it used?**

[Panel](src/app/components/panel/panel.ts) is a chrome-only component: a
title, a header, and two places for a caller to put real content, via
`<ng-content>`:

```html
<section class="panel">
  <header class="panel-header">
    <h2>{{ title }}</h2>
    <div class="panel-actions">
      <ng-content select="[panel-actions]"></ng-content>
    </div>
  </header>
  <div class="panel-body">
    <ng-content></ng-content>
  </div>
</section>
```

The default (unselected) `<ng-content>` projects whatever a caller puts
directly inside `<app-panel>...</app-panel>` into the body; `<ng-content
select="[panel-actions]">` projects only the content tagged with a
`panel-actions` attribute into the header instead. `ReviewForm` uses this to
put a review-count badge in the header while the composer and review list go
in the body:

```html
<app-panel title="Leave a review">
  <span panel-actions class="count-badge">{{ reviews().length }} reviews</span>
  <div class="composer">...</div>
</app-panel>
```

`DynamicLoader` reuses the same component for a completely different header
action (a "Clear all" button) and completely different body content (the
widget grid) — the point of content projection: `Panel` doesn't know or care
what's projected into it, so one component serves both sections instead of
each needing its own hand-rolled card markup.

## What I actually found when I drove this in a real browser

Writing the unit tests surfaced a real zoneless-Angular gotcha worth
recording, since it isn't obvious from the Angular docs: calling
`fixture.detectChanges()` right after **mutating a component field directly**
(`component.setRating(4)`) rather than through a real DOM event intermittently
threw `NG0100: ExpressionChangedAfterItHasBeenCheckedError` on an unrelated
subsequent render, even though nothing was actually wrong with the binding.
Switching the tests to interact the way a real user would — clicking the
actual star buttons, dispatching a real `input` event on the textarea — made
the failures disappear ([review-form.spec.ts](src/app/components/review-form/review-form.spec.ts)).
The honest lesson: in a zoneless app, driving state through the same path a
real user/event would use isn't just more realistic, it sidesteps change-
detection edge cases that bypassing Angular's own event handling can trigger.

The same caution applied to manually driving the running app with Playwright:
a first pass that read a widget's `.value` text immediately after clicking
its button saw **stale text** (a counter's `+5` click not reflected, a
"Next quote" click producing the same quote). This wasn't an app bug —
`ComponentRef.destroy()` (used by "Clear all" and the widgets' close
buttons) removes DOM nodes synchronously, but a plain signal-driven
text binding like `{{ count() }}` is repainted through zoneless's batched
render scheduler, which doesn't flush synchronously on the same tick as the
click. Waiting for the expected text (`page.waitForFunction`) instead of
reading it immediately gave the correct values every time; see
[dynamic-loader.ts](src/app/components/dynamic-loader/dynamic-loader.ts)'s
widgets for the components themselves, which needed no changes — only the
verification script did.

## Tasks

1. **Create a dynamic component loaded based on user input** —
   [DynamicLoader](src/app/components/dynamic-loader/dynamic-loader.ts) picks
   from Counter/Clock/Quote based on a `<select>` and creates the chosen one
   via `ViewContainerRef.createComponent()`, with `@Input`/`@Output` wired up
   imperatively since there's no template binding site for a runtime-created
   component.
2. **Build a parent-child component structure with `@Input` and `@Output`** —
   [ReviewForm](src/app/components/review-form/review-form.ts) (parent) and
   [StarRating](src/app/components/star-rating/star-rating.ts) (child), used
   twice over: once editable (both bindings), once read-only (`@Input` only).
