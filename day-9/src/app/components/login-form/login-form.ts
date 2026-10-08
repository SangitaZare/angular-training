import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: false,
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  get canSubmit(): boolean {
    return this.username.trim().length > 0 && this.password.length > 0 && !this.submitting();
  }

  onUsernameInput(event: Event): void {
    this.username = (event.target as HTMLInputElement).value;
  }

  onPasswordInput(event: Event): void {
    this.password = (event.target as HTMLInputElement).value;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err.status === 401
            ? 'Invalid username or password.'
            : 'Something went wrong. Please try again.',
        );
      },
    });
  }
}
