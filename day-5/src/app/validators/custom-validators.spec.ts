import { FormControl, FormGroup } from '@angular/forms';

import {
  emailFormatValidator,
  passwordStrengthValidator,
  passwordsMatchValidator,
} from './custom-validators';

describe('emailFormatValidator', () => {
  const control = new FormControl('', emailFormatValidator());

  it('passes empty values (let Validators.required handle that)', () => {
    control.setValue('');
    expect(control.errors).toBeNull();
  });

  it('rejects a value with no @', () => {
    control.setValue('not-an-email');
    expect(control.errors).toEqual({ emailFormat: true });
  });

  it('rejects a value with no domain suffix', () => {
    control.setValue('user@localhost');
    expect(control.errors).toEqual({ emailFormat: true });
  });

  it('accepts a well-formed email', () => {
    control.setValue('user@example.com');
    expect(control.errors).toBeNull();
  });
});

describe('passwordStrengthValidator', () => {
  const control = new FormControl('', passwordStrengthValidator());

  it('passes empty values (let Validators.required handle that)', () => {
    control.setValue('');
    expect(control.errors).toBeNull();
  });

  it('reports every missing rule', () => {
    control.setValue('weak');
    expect(control.errors?.['passwordStrength']).toEqual({
      minLength: true,
      upperCase: true,
      digit: true,
      specialChar: true,
    });
  });

  it('accepts a password meeting all rules', () => {
    control.setValue('Str0ng!Pass');
    expect(control.errors).toBeNull();
  });
});

describe('passwordsMatchValidator', () => {
  function buildGroup(password: string, confirmPassword: string) {
    return new FormGroup(
      {
        password: new FormControl(password),
        confirmPassword: new FormControl(confirmPassword),
      },
      { validators: passwordsMatchValidator() },
    );
  }

  it('passes when either field is empty (let required handle that)', () => {
    expect(buildGroup('', '').errors).toBeNull();
  });

  it('flags mismatched passwords', () => {
    expect(buildGroup('Str0ng!Pass', 'Different1!').errors).toEqual({ passwordsMismatch: true });
  });

  it('passes when both passwords match', () => {
    expect(buildGroup('Str0ng!Pass', 'Str0ng!Pass').errors).toBeNull();
  });
});
