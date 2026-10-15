import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  emailFormatValidator,
  passwordStrengthValidator,
  passwordsMatchValidator,
} from '../../validators/custom-validators';

@Component({
  selector: 'app-registration-form',
  standalone: false,
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css',
})
export class RegistrationForm {
  readonly form: FormGroup;
  readonly submitted = signal(false);
  readonly registeredUsername = signal<string | null>(null);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, emailFormatValidator()]],
        password: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordsMatchValidator() },
    );
  }

  get username() {
    return this.form.get('username')!;
  }
  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }
  get confirmPassword() {
    return this.form.get('confirmPassword')!;
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.registeredUsername.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.registeredUsername.set(this.username.value);
    this.form.reset();
    this.submitted.set(false);
  }
}
