import { Component, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Drives both the sidenav's mode ('over' on a handset so it floats above
  // the content, 'side' otherwise so it pushes content aside) and whether
  // the toggle button is shown at all — read as a signal, the same pattern
  // Day 7's FeedbackForm used, since this app is zoneless and an Observable
  // alone wouldn't re-render the template without an async pipe.
  readonly isHandset = signal(false);

  constructor() {
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(takeUntilDestroyed())
      .subscribe((state) => this.isHandset.set(state.matches));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
