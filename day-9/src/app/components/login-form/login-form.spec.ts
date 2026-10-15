import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import { LoginForm } from './login-form';
import { createMockJwt } from '../../auth/jwt';

function setup(queryParams: Record<string, string> = {}) {
  TestBed.configureTestingModule({
    declarations: [LoginForm],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
      },
    ],
  });

  const fixture = TestBed.createComponent(LoginForm);
  fixture.detectChanges();

  return {
    fixture,
    component: fixture.componentInstance,
    httpMock: TestBed.inject(HttpTestingController),
    router: TestBed.inject(Router),
  };
}

function usernameInput(fixture: ComponentFixture<LoginForm>): HTMLInputElement {
  return fixture.nativeElement.querySelector('#username');
}

function passwordInput(fixture: ComponentFixture<LoginForm>): HTMLInputElement {
  return fixture.nativeElement.querySelector('#password');
}

function submitButton(fixture: ComponentFixture<LoginForm>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button[type="submit"]');
}

function typeCredentials(fixture: ComponentFixture<LoginForm>, username: string, password: string): void {
  const userEl = usernameInput(fixture);
  userEl.value = username;
  userEl.dispatchEvent(new Event('input'));

  const passEl = passwordInput(fixture);
  passEl.value = password;
  passEl.dispatchEvent(new Event('input'));

  fixture.detectChanges();
}

describe('LoginForm', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('disables submit until both fields have a value', () => {
    const { fixture } = setup();

    expect(submitButton(fixture).disabled).toBe(true);

    typeCredentials(fixture, 'admin', 'admin123');

    expect(submitButton(fixture).disabled).toBe(false);
  });

  it('logs in and navigates to /dashboard on success', () => {
    const { fixture, httpMock, router } = setup();
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    typeCredentials(fixture, 'admin', 'admin123');
    submitButton(fixture).click();

    httpMock.expectOne('/api/auth/login').flush({ token: createMockJwt('admin', 'admin', 3600) });

    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
    httpMock.verify();
  });

  it('navigates to returnUrl instead of /dashboard when one was given', () => {
    const { fixture, httpMock, router } = setup({ returnUrl: '/admin' });
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    typeCredentials(fixture, 'admin', 'admin123');
    submitButton(fixture).click();

    httpMock.expectOne('/api/auth/login').flush({ token: createMockJwt('admin', 'admin', 3600) });

    expect(navigateSpy).toHaveBeenCalledWith('/admin');
    httpMock.verify();
  });

  it('shows an error and stays on the page when credentials are rejected', () => {
    const { fixture, httpMock, component } = setup();

    typeCredentials(fixture, 'admin', 'wrong-password');
    submitButton(fixture).click();

    httpMock
      .expectOne('/api/auth/login')
      .flush({ message: 'Invalid username or password.' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Invalid username or password.');
    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain('Invalid username');
    httpMock.verify();
  });
});
