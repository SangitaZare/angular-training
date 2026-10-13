import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, RouterModule, provideRouter } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { App } from './app';
import { TOKEN_KEY } from './auth/auth.service';
import { createMockJwt } from './auth/jwt';

function setup() {
  const breakpoint$ = new Subject<BreakpointState>();

  TestBed.configureTestingModule({
    declarations: [App],
    imports: [
      RouterModule,
      NoopAnimationsModule,
      MatToolbarModule,
      MatSidenavModule,
      MatListModule,
      MatIconModule,
      MatButtonModule,
    ],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: BreakpointObserver, useValue: { observe: () => breakpoint$.asObservable() } },
    ],
  });

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();

  return { fixture, breakpoint$ };
}

describe('App', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('creates the app', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows no logout button and no nav links when logged out', () => {
    const { fixture } = setup();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).not.toContain('Log out');
    expect(el.querySelector('a[href="/dashboard"]')).toBeFalsy();
  });

  it('shows the current user, a logout button, and both nav links when logged in', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 3600));
    const { fixture } = setup();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('admin');
    expect(el.textContent).toContain('Dashboard');
    expect(el.textContent).toContain('Share');
    expect(el.querySelector('button[aria-label="Log out"]')).toBeTruthy();
  });

  it('logout clears the session and navigates to /login', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 3600));
    const { fixture } = setup();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture.componentInstance.logout();

    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });

  it('switches the sidenav to "over" mode and shows a menu toggle on a handset breakpoint', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 3600));
    const { fixture, breakpoint$ } = setup();

    breakpoint$.next({ matches: true, breakpoints: {} });
    fixture.detectChanges();

    expect(fixture.componentInstance.isHandset()).toBe(true);
    expect(fixture.nativeElement.querySelector('button[aria-label="Toggle navigation menu"]')).toBeTruthy();
  });
});
