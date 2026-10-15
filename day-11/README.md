# Day 11: QR Code Generation and Language Translation

An Angular app (NgModule-based, generated with Angular CLI 21, zoneless) built
to cover the Day 11 curriculum: generating QR codes from user data (with an
optional logo), and multilingual support. A small QR generator form plus a
two-button English/Spanish switch in the header.

**Why plain `qrcode`, not `ngx-qrcode`:** this repo is on Angular 21, and
every Angular-specific QR wrapper worth considering (`angularx-qrcode`, the
closest maintained successor to the various `ngx-qrcode*` packages) declares
a peer dependency capped at a specific Angular major (`angularx-qrcode@22`
requires Angular `>=22.0.0 <23.0.0` — it won't even install cleanly here).
The plain [`qrcode`](https://www.npmjs.com/package/qrcode) package has no
Angular peer dependency at all, so there's nothing to fight; [QrCodeService](src/app/services/qr-code.service.ts)
is the thin Angular wrapper around it this exercise is actually asking for.

**Why `ng new`'s default Vitest here (unlike Day 10):** Day 10's curriculum
specifically named Jasmine/Karma, so that app alone used Karma. Day 11's
curriculum doesn't mention a test runner, so this one follows the repo's
normal default — see [[project-day10-karma-jasmine-choice]] if you're
tracking which days deviate and why.

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
| Generate a QR code (PNG/JPEG) for user data | [QrCodeService](src/app/services/qr-code.service.ts) (wraps `qrcode`'s `toCanvas` + `canvas.toDataURL`) driven by [QrGenerator](src/app/components/qr-generator/qr-generator.ts) (the form) |
| Include a logo in the QR code | [QrCodeService.render()](src/app/services/qr-code.service.ts#L17-L30)'s logo branch, calling the private `drawLogo()` |
| Language toggle (English/Spanish) with ngx-translate | [LanguageSwitcher](src/app/components/language-switcher/language-switcher.ts) + [public/i18n/en.json](public/i18n/en.json) / [es.json](public/i18n/es.json), wired up in [app-module.ts](src/app/app-module.ts) |

All four pieces (`QrCodeService`, `QrGenerator`, `LanguageSwitcher`, `App`)
have matching `*.spec.ts` files — 15 tests total, run with `ng test`.

## Concepts

**How do you generate a QR code in Angular?**

Angular has no QR support of its own — this wraps the plain `qrcode` npm
package's `toCanvas()`, which draws directly onto an `HTMLCanvasElement` you
already have in the DOM (via a template `#qrCanvas` reference captured with
`@ViewChild`):

```ts
// qr-code.service.ts
async render(canvas: HTMLCanvasElement, text: string, options: QrRenderOptions = {}): Promise<void> {
  await toCanvas(canvas, text, {
    errorCorrectionLevel: 'H',
    width: 320,
    margin: 2,
  });
  if (options.logo) {
    this.drawLogo(canvas, options.logo, options.logoSizeRatio ?? 0.22);
  }
}
```

[QrGenerator](src/app/components/qr-generator/qr-generator.ts) calls this
from its submit handler, then reads the result back out as a data URL for
the download link — `toCanvas` returning a `Promise<void>` (it draws onto
the canvas you gave it rather than returning an image) is why `render()` is
`async` and `onSubmit` chains a `.then()`/`.catch()` rather than treating it
like a value-returning call.

**How can you include a logo in a QR code?**

By drawing over the finished code afterward — the `qrcode` library has no
logo concept, so this is manual canvas work in `drawLogo()`:

```ts
private drawLogo(canvas: HTMLCanvasElement, logo: HTMLImageElement, sizeRatio: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = canvas.width * sizeRatio;
  const x = (canvas.width - size) / 2;
  const y = (canvas.height - size) / 2;
  const padding = size * 0.12;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - padding, y - padding, size + padding * 2, size + padding * 2);
  ctx.drawImage(logo, x, y, size, size);
}
```

Two things make this safe rather than just "technically possible": the QR is
generated with `errorCorrectionLevel: 'H'` (the highest of the four levels —
roughly 30% of the code's modules can be unreadable and it still scans)
specifically *because* a centered logo is going to blot out real modules
underneath it; and the white backing square behind the logo matters for any
non-opaque-square image — without it, whatever the logo doesn't cover
blends into the QR pattern instead of standing clearly apart from it. The
default `logoSizeRatio` of `0.22` (≈4.8% of the code's area, comfortably
under that 30%) is a deliberately conservative default, not a hard limit —
push it much higher and the "still scans" guarantee stops holding.

**What is ngx-translate, and how does it handle language translation?**

It's a library that keeps your UI text as string keys in your templates
(`'QR.HEADING'`) and resolves them against a loaded dictionary for whichever
language is currently active — so switching languages means swapping which
dictionary is active, not conditionally rendering different markup. This
app's dictionaries are plain JSON files, [public/i18n/en.json](public/i18n/en.json)
and [public/i18n/es.json](public/i18n/es.json), fetched over HTTP by
`@ngx-translate/http-loader`:

```ts
// app-module.ts
provideTranslateService({
  lang: 'en',
  fallbackLang: 'en',
  loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
}),
```

(`prefix: '/i18n/'` matters here: the loader's own default is `/assets/i18n/`,
which is the older `src/assets` convention — this project, like every other
day in this repo, uses the newer top-level `public/` folder instead, so
`public/i18n/en.json` is actually served at `/i18n/en.json`.)

Templates pull a key through the `translate` pipe, which re-resolves
automatically when the active language changes:

```html
<!-- qr-generator.html -->
<h2 id="qr-heading">{{ 'QR.HEADING' | translate }}</h2>
```

and [LanguageSwitcher](src/app/components/language-switcher/language-switcher.ts)
is what actually changes which language is active:

```ts
use(lang: string): void {
  this.translate.use(lang).subscribe();
}
```

`use()` does two things: it switches `TranslateService.currentLang` (a
`Signal`, which is what the switcher's own template reads to highlight the
active button — `translate.currentLang() === 'en'`) and, if that language's
translations haven't been loaded yet, it triggers the HTTP loader to fetch
them first. One note specific to this library's current version: the two
language buttons' own labels ("English" / "Español") are plain hardcoded
text, not translated — language *names* are proper nouns, so "English"
reading "English" regardless of which language is currently active is the
expected behavior, not a bug.

## Tasks

1. **Create a component to generate QR codes (PNG/JPEG) for user data** —
   [QrGenerator](src/app/components/qr-generator/qr-generator.ts): a text/URL
   input, an optional logo file picker, and a PNG/JPEG format selector feed
   [QrCodeService](src/app/services/qr-code.service.ts), whose `toDataUrl()`
   produces the `<a download>` link's `href`.
2. **Implement a language toggle (English, Spanish) using ngx-translate** —
   [LanguageSwitcher](src/app/components/language-switcher/language-switcher.ts)
   plus [public/i18n/en.json](public/i18n/en.json) / [es.json](public/i18n/es.json);
   every label in [App](src/app/app.html) and [QrGenerator](src/app/components/qr-generator/qr-generator.html)
   goes through the `translate` pipe so the whole page's text switches, not
   just the generator form.
