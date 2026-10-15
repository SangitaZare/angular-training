# Day 5: Angular Forms

An Angular app (NgModule-based, generated with Angular CLI 21) built to cover
the Day 5 curriculum: template-driven forms, reactive forms, form
validation, and custom validators. It has two form cards on one page — a
**reactive** registration form and a **template-driven** contact form — so
both approaches are visible side by side.

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
| Reactive form with custom validation | [registration-form.ts](src/app/components/registration-form/registration-form.ts) / [.html](src/app/components/registration-form/registration-form.html) — username, email, password, confirm password |
| Custom validators | [validators/custom-validators.ts](src/app/validators/custom-validators.ts) — `emailFormatValidator`, `passwordStrengthValidator`, `passwordsMatchValidator` |
| Template-driven form with basic validation | [contact-form.ts](src/app/components/contact-form/contact-form.ts) / [.html](src/app/components/contact-form/contact-form.html) — name, email, phone, message |

All components and the validators have unit tests in matching `*.spec.ts`
files (22 tests, run with `ng test`) — including direct tests of each
custom validator in isolation, not just through the component.

## Concepts

**What is the difference between template-driven and reactive forms?**

|  | Template-driven | Reactive |
|---|---|---|
| Where the form model lives | Implicitly, built by Angular from `ngModel` directives in the template | Explicitly, built in the component class with `FormGroup`/`FormControl` |
| How you bind a field | `[(ngModel)]="model.name"` + `name="name"` on the `<input>` | `formControlName="name"` on the `<input>`, referencing a control already created in TypeScript |
| How you validate | HTML attributes (`required`, `minlength`, `pattern`, `email`) | Validator functions passed to the control: `Validators.required`, or a custom `ValidatorFn` |
| Testability | Harder — the form only fully exists once the template renders | Easier — the `FormGroup` can be built and asserted on with no template at all (see [custom-validators.spec.ts](src/app/validators/custom-validators.spec.ts), which tests validators with zero HTML) |
| Best for | Small, simple forms | Forms with cross-field rules, dynamic controls, or that need to be unit tested |

This project has one of each: [contact-form.html](src/app/components/contact-form/contact-form.html)
is template-driven (note the `#name="ngModel"` template reference
variables used to read validity in the template); [registration-form.ts](src/app/components/registration-form/registration-form.ts)
is reactive (the entire form shape is built with `FormBuilder.group(...)`
in the constructor, and the template just binds to it).

**How do you implement a custom validator in a reactive form?**

A custom validator is a function matching Angular's `ValidatorFn` type:
`(control: AbstractControl) => ValidationErrors | null`. Return `null` when
the control is valid, or an object describing what's wrong when it isn't.
See [emailFormatValidator](src/app/validators/custom-validators.ts):

```ts
export function emailFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) return null; // let Validators.required handle empty
    return EMAIL_PATTERN.test(value) ? null : { emailFormat: true };
  };
}
```

Attach it alongside built-in validators in an array:

```ts
email: ['', [Validators.required, emailFormatValidator()]],
```

[passwordStrengthValidator](src/app/validators/custom-validators.ts) goes
further — instead of a single true/false error, it returns an object
listing *which* rules failed (`minLength`, `upperCase`, `lowerCase`,
`digit`, `specialChar`), so the template can render a per-rule checklist
rather than one generic message.

Not every custom validator inspects a single control. A validator can also
be attached to the whole `FormGroup` when it needs to compare sibling
fields — [passwordsMatchValidator](src/app/validators/custom-validators.ts)
reads both `password` and `confirmPassword` off the group it's passed:

```ts
this.fb.group(
  { password: [...], confirmPassword: [...] },
  { validators: passwordsMatchValidator() }, // group-level, not per-control
);
```

**How do you handle form submission errors?**

Both forms follow the same pattern on submit:

1. Set a `submitted` signal to `true`. Error messages are shown when a
   field is `invalid && (touched || submitted)` — the `submitted` half
   matters because a user can click Submit on a field they never
   interacted with, which wouldn't otherwise be `touched`.
2. If the form (or `NgForm`, for the template-driven case) is invalid,
   mark everything touched — [`form.markAllAsTouched()`](src/app/components/registration-form/registration-form.ts)
   for the reactive form — so every error becomes visible at once, and
   return early without doing anything else.
3. Only once the form is valid does the handler act on the data (here,
   just setting a success message and resetting the form — a real app
   would call a service here instead).

See [`onSubmit`](src/app/components/registration-form/registration-form.ts)
in the reactive form and [`onSubmit`](src/app/components/contact-form/contact-form.ts)
in the template-driven one — both are tested for the invalid-submission
path (errors shown, nothing saved) and the valid-submission path (data
captured, form reset) in their `.spec.ts` files.

## Tasks

1. **Reactive form with custom validation** —
   [RegistrationForm](src/app/components/registration-form/registration-form.ts):
   email format and password strength are custom `ValidatorFn`s (not just
   Angular's built-in `Validators.email`), plus a group-level custom
   validator confirming the password and confirm-password fields match.
2. **Template-driven form with basic validation** —
   [ContactForm](src/app/components/contact-form/contact-form.ts): name,
   email, and message use `required`/`minlength`/`email` template
   attributes with `#ctrl="ngModel"` template reference variables to
   surface per-field errors; phone is optional but validated with
   `pattern` when provided.
