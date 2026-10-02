import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates that a control's value looks like `local@domain.tld`.
 * Returns `{ emailFormat: true }` when invalid, `null` when valid or empty
 * (pair with `Validators.required` to also forbid empty values).
 */
export function emailFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) return null;
    return EMAIL_PATTERN.test(value) ? null : { emailFormat: true };
  };
}

export interface PasswordStrengthErrors {
  minLength?: boolean;
  upperCase?: boolean;
  lowerCase?: boolean;
  digit?: boolean;
  specialChar?: boolean;
}

/**
 * Validates password strength: at least `minLength` characters, one
 * uppercase letter, one lowercase letter, one digit, and one special
 * character. Returns a `{ passwordStrength: PasswordStrengthErrors }`
 * object listing exactly which rules failed, so the template can render
 * a checklist instead of a single pass/fail message.
 */
export function passwordStrengthValidator(minLength = 8): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;

    const errors: PasswordStrengthErrors = {};
    if (value.length < minLength) errors.minLength = true;
    if (!/[A-Z]/.test(value)) errors.upperCase = true;
    if (!/[a-z]/.test(value)) errors.lowerCase = true;
    if (!/[0-9]/.test(value)) errors.digit = true;
    if (!/[^A-Za-z0-9]/.test(value)) errors.specialChar = true;

    return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
  };
}

/**
 * Cross-field validator for a `FormGroup` with `password` and
 * `confirmPassword` controls. Must be applied at the group level (not on
 * a single control) since it needs to read two sibling controls' values.
 */
export function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  };
}
