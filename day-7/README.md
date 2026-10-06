# Day 7: Angular Performance and UI/UX

An Angular app (NgModule-based, generated with Angular CLI 21, zoneless) built
to cover the Day 7 curriculum: `OnPush` change detection and Angular
Material with responsive, accessible layout. One page, two halves:

- A **product dashboard** with two nearly-identical cards — one Default
  strategy, one refactored to `OnPush` — each instrumented with a visible
  "Checked ×N" counter, so you can watch Angular's change detection happen
  instead of taking it on faith.
- A **feedback form** built entirely from Angular Material components, with
  a responsive layout driven by the CDK's `BreakpointObserver` and
  accessibility wired in throughout (labels, `mat-error`, keyboard-operable
  controls, live-region confirmation).

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
| Refactor a component to `OnPush` | [product-card.ts](src/app/components/product-card/product-card.ts) (`ChangeDetectionStrategy.OnPush`) vs. [product-card-legacy.ts](src/app/components/product-card-legacy/product-card-legacy.ts) (`Default`) — same template, same `ngDoCheck` counter, one-line difference in the `@Component` decorator |
| OnPush demo / instrumentation | [product-dashboard.ts](src/app/components/product-dashboard/product-dashboard.ts) / [.html](src/app/components/product-dashboard/product-dashboard.html), [activity-ticker.ts](src/app/services/activity-ticker.ts) |
| Material form with responsive design | [feedback-form.ts](src/app/components/feedback-form/feedback-form.ts) / [.html](src/app/components/feedback-form/feedback-form.html) — `mat-form-field`/`input`/`select`/`radio-group`/`checkbox`, `BreakpointObserver` driving a 1-column/2-column CSS grid |

All components and the service have unit tests in matching `*.spec.ts`
files (26 tests, run with `ng test`).

## Concepts

**How does OnPush change detection improve performance?**

The textbook answer, and the one that's still correct and worth knowing:
by default (`ChangeDetectionStrategy.Default`, sometimes called
"CheckAlways"), a component is re-checked on *every* change detection pass
that reaches it, regardless of whether anything it displays actually
changed. `OnPush` ([product-card.ts](src/app/components/product-card/product-card.ts))
tells Angular it's safe to skip checking a component unless one of a few
specific things happened: an `@Input()` was given a **new reference**, an
event originated from inside the component, something called
`ChangeDetectorRef.markForCheck()`, or (as here) a signal the component
reads changed. In a large app with many Default-strategy components, that
skip is the entire performance win — fewer components checked per pass.

```ts
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ProductCard { @Input({ required: true }) product!: Product; }
```

The practical consequence: an `OnPush` component **must** be fed new data
immutably. [ProductDashboard.renameFirstProductImmutably()](src/app/components/product-dashboard/product-dashboard.ts)
replaces the array and the changed object (`list.map((p, i) => i === 0 ?
{ ...p, name: ... } : p)`); mutating `product.name` in place
(`mutateFirstProductInPlace()`) is kept in the demo specifically as the
anti-pattern — Angular compares `@Input()` values by reference, so a
mutated-in-place object looks unchanged to an `OnPush` component even
though its content moved.

**What I actually found when I tested it in this app.** I built the classic
"watch the OnPush card's counter stay frozen while the Default one climbs"
demo — exactly what you'd expect from the explanation above, and what
every zone.js-era Angular tutorial shows. It doesn't hold up here. I
instrumented both cards with `ngDoCheck()` counters
([ProductCard](src/app/components/product-card/product-card.ts),
[ProductCardLegacy](src/app/components/product-card-legacy/product-card-legacy.ts))
and verified, three independent ways — a minimal TestBed repro with no
Material involved at all, this app's own `ng serve` dev build, and this
app's **production** build (`ng build --configuration production`), all
driven with Playwright rather than eyeballed — that **both cards' counters
climb together**, every time, whenever *anything* in the app changes:
clicking "Simulate background activity now", the 1.5s auto-tick, or even
typing a single character into the unrelated Material form in the other
half of the page. `OnPush` visibly does not prune the unrelated card out
of that change-detection pass in this project's Angular 21.2, zoneless
setup.

My best understanding of why, from reading Angular's own source
(`@angular/core/fesm2022/_debug_node-chunk.mjs` in `node_modules`, cross-
checked against `packages/core/src/render3/instructions/change_detection.ts`
on GitHub): a view is only rechecked if `CheckAlways` (Default's flag) is
set, or its `Dirty`/`RefreshView` bits are set, or a signal it reads
directly changed. `OnPush` components start with `Dirty` set (so they get
their first check) and it's cleared after that first `refreshView()` call
— but neither `App` (the root) nor `ProductDashboard` (the container) is
itself `OnPush`, so once *either* of them refreshes for any reason, the
framework cascades into **all** of their children in the same "global"
mode, `OnPush` included. The two cards here sit under a `Default`-strategy
container, which is enough to put them back in that global sweep on every
app-wide change. This is a verified behavior of this specific setup, not a
guess — see
[product-dashboard.spec.ts](src/app/components/product-dashboard/product-dashboard.spec.ts)'s
`both cards ARE checked together...` test, which pins it down as a
regression check. What's still reliably true even here (and is its own
real, provable zoneless win): when **nothing** changes anywhere, *neither*
card gets rechecked at all — see the `stays flat when nothing changes`
tests on both cards.

The honest takeaway: `OnPush` is still the framework's documented
mechanism for pruning subtrees, it's still correct practice to write
components that only mutate data immutably, and it still matters a great
deal in zone.js-based apps (most Angular apps in production today). But
"does `OnPush` visibly skip an unrelated branch" is apparently one of the
things that's genuinely still in flux as Angular finishes its zoneless
transition — worth re-verifying against whatever Angular version you're
actually running, the same way I did here, rather than trusting a
tutorial (including this one, a year from now).

**What is Angular Material, and how does it enhance UI?**

Angular Material is the component library (plus the Component Dev Kit,
`@angular/cdk`) maintained by the Angular team, implementing Material
Design 3. It was added here with `ng add @angular/material`, which wired
up [material-theme.scss](src/material-theme.scss) (`@use '@angular/material'
as mat; @include mat.theme(...)` — Material 3's CSS-variable-based theming,
no Sass `$theme` object to hand-assemble like older Material versions) and
pulled in the Roboto font + Material Symbols icon font in
[index.html](src/index.html). [FeedbackForm](src/app/components/feedback-form/feedback-form.html)
uses `mat-form-field`/`matInput`, `mat-select`, `mat-radio-group`,
`mat-checkbox`, and `mat-raised-button`; it enhances the UI in three
concrete ways over hand-rolled HTML form controls: consistent, accessible
styling driven by design tokens (`var(--mat-sys-primary)` etc., so the
whole app re-themes from one `mat.theme()` call); built-in interaction
states (focus, hover, invalid, disabled) that would otherwise be
hand-written CSS; and components like `mat-select`/`mat-checkbox` that
wrap the harder parts of making a custom control keyboard- and
screen-reader-accessible, which plain `<div>`-based widgets don't get for
free.

**What are accessibility best practices in Angular?**

The practices this app actually applies, not just a list:

- **Real interactive elements, not styled `<div>`s.** The favorite toggle
  is a `<button mat-icon-button>` with `[attr.aria-pressed]` reflecting its
  state ([product-card.html](src/app/components/product-card/product-card.html)) —
  keyboard-focusable and announced as a toggle button by default, which a
  clickable `<span>` never would be.
- **Every form control has a programmatic label.** `<mat-label>` inside
  `mat-form-field` associates with its `matInput`/`mat-select` via
  Material's internal `aria-labelledby` wiring automatically; the
  `mat-radio-group` (which has no single native input to label) instead
  gets an explicit `aria-labelledby="priority-label"` pointing at a real
  `<label>` ([feedback-form.html](src/app/components/feedback-form/feedback-form.html)).
- **Errors are associated with their field, not just colored red.**
  `mat-error` is wired by Material to the input's `aria-describedby`
  automatically, so a screen reader announces *why* a field is invalid
  when it receives focus, not just that it is.
- **Live regions are used sparingly, for the content that matters.** The
  post-submit confirmation uses `role="status"` ([feedback-form.html](src/app/components/feedback-form/feedback-form.html)),
  and `MatSnackBar` announces itself the same way — but the per-card
  "Checked ×N" debug badges deliberately do **not** have a live-region
  role, since they'd otherwise re-announce to screen reader users every
  1.5 seconds for no benefit. Accessibility isn't "add `aria-live`
  everywhere"; it's reserving it for things a user actually needs to hear.
- **Responsive layout is a CDK concern, not just a CSS one.**
  [FeedbackForm](src/app/components/feedback-form/feedback-form.ts) injects
  `BreakpointObserver` and observes `Breakpoints.Handset`, collapsing the
  form from a 2-column to a 1-column grid
  ([feedback-form.css](src/app/components/feedback-form/feedback-form.css)) —
  letting Angular's CDK define "handset-width" rather than hand-picking a
  pixel breakpoint, and keeping the layout decision in one place
  (`isHandset` signal) that both the template and, if needed, component
  logic can read.

## Tasks

1. **Refactor a component to use `OnPush` change detection** —
   [ProductCard](src/app/components/product-card/product-card.ts) is
   `OnPush`; [ProductCardLegacy](src/app/components/product-card-legacy/product-card-legacy.ts)
   is kept, unchanged otherwise, as the "before" for comparison. Both are
   instrumented and unit-tested (see the Concepts section above for what
   the instrumentation actually showed in this app).
2. **Build a form using Angular Material components with responsive
   design** — [FeedbackForm](src/app/components/feedback-form/feedback-form.ts)
   (name/email/category/priority/message/subscribe, validated with
   `Validators`, submitted through `MatSnackBar`), responsive via
   `BreakpointObserver` collapsing to one column on handset-width
   viewports.
