import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule, provideRouter } from '@angular/router';

import { App } from './app';
import { TOKEN_KEY } from './auth/auth.service';
import { createMockJwt } from './auth/jwt';

function setup() {
  TestBed.configureTestingModule({
    declarations: [App],
    imports: [RouterModule],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  return fixture;
}

describe('App', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('creates the app', () => {
    const fixture = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows a login link and no logout button when logged out', () => {
    const fixture = setup();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Log in');
    expect(text).not.toContain('Log out');
  });

  it('shows the current user, a logout button, and the Admin link for an admin', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 'admin', 3600));
    const fixture = setup();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('admin (admin)');
    expect(text).toContain('Log out');
    expect(fixture.nativeElement.querySelector('a[href="/admin"]')).toBeTruthy();
  });

  it('hides the Admin link for a logged-in regular user', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('user', 'user', 3600));
    const fixture = setup();

    expect(fixture.nativeElement.textContent).toContain('user (user)');
    expect(fixture.nativeElement.querySelector('a[href="/admin"]')).toBeFalsy();
  });
});
