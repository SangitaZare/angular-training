import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';

export type FeedbackCategory = 'bug' | 'feature' | 'question' | 'other';
export type FeedbackPriority = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-feedback-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feedback-form.html',
  styleUrl: './feedback-form.css',
})
export class FeedbackForm {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Drives the responsive layout: one column on a handset-width viewport,
  // two columns otherwise. Read with a signal (via toSignal-style wiring
  // below) so the OnPush template re-renders when the breakpoint flips —
  // an Observable alone wouldn't, without an `async` pipe, in this
  // zoneless app.
  readonly isHandset = signal(false);

  readonly categories: { value: FeedbackCategory; label: string }[] = [
    { value: 'bug', label: 'Bug' },
    { value: 'feature', label: 'Feature request' },
    { value: 'question', label: 'Question' },
    { value: 'other', label: 'Other' },
  ];

  readonly submitted = signal(false);

  // Needed so submit() can call resetForm() rather than form.reset(): the
  // [formGroup] directive tracks its own `submitted` flag (which is what
  // Material's default ErrorStateMatcher checks to decide whether to show
  // mat-error), and plain form.reset() doesn't clear it — resetForm() does.
  private readonly formDirective = viewChild.required(FormGroupDirective);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    category: this.fb.nonNullable.control<FeedbackCategory>('bug', Validators.required),
    priority: this.fb.nonNullable.control<FeedbackPriority>('medium', Validators.required),
    message: ['', [Validators.required, Validators.minLength(10)]],
    subscribe: [false],
  });

  constructor() {
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(takeUntilDestroyed())
      .subscribe((state) => this.isHandset.set(state.matches));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.set(true);
    this.snackBar.open(`Thanks ${this.form.controls.name.value} — feedback submitted.`, 'Close', {
      duration: 4000,
    });

    const subscribe = this.form.controls.subscribe.value;
    this.formDirective().resetForm({
      name: '',
      email: '',
      category: 'bug',
      priority: 'medium',
      message: '',
      subscribe,
    });
  }
}
