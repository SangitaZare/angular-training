import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService, TOKEN_KEY } from './auth.service';
import { createMockJwt } from './jwt';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('starts logged out when there is no stored token', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('logs in by posting credentials and decodes the returned token', () => {
    let result: { username: string; role: string } | undefined;
    service.login('admin', 'admin123').subscribe((user) => (result = user));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'admin123' });
    req.flush({ token: createMockJwt('admin', 'admin', 3600) });

    expect(result).toEqual({ username: 'admin', role: 'admin' });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual({ username: 'admin', role: 'admin' });
  });

  it('stores the raw token so the interceptor can read it back', () => {
    service.login('user', 'user123').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: createMockJwt('user', 'user', 3600) });

    expect(service.getToken()).toEqual(expect.any(String));
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe(service.getToken());
  });

  it('hasRole reflects the logged-in user, not the other role', () => {
    service.login('admin', 'admin123').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: createMockJwt('admin', 'admin', 3600) });

    expect(service.hasRole('admin')).toBe(true);
    expect(service.hasRole('user')).toBe(false);
  });

  it('logout clears both the stored token and the current user', () => {
    service.login('user', 'user123').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: createMockJwt('user', 'user', 3600) });

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('getToken clears an expired token and reports logged out', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    service.login('user', 'user123').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: createMockJwt('user', 'user', 60) });
    expect(service.isAuthenticated()).toBe(true);

    vi.setSystemTime(new Date('2026-01-01T00:01:01Z'));

    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);

    vi.useRealTimers();
  });
});

describe('AuthService construction', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('restores the session from a valid token already in storage', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 'admin', 3600));

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual({ username: 'admin', role: 'admin' });
  });

  it('discards an expired token found in storage instead of restoring it', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 'admin', -1));

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
