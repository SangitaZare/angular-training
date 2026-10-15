import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService, TOKEN_KEY } from './auth.service';
import { createMockJwt } from './jwt';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  function setup() {
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  }

  it('attaches a Bearer token to API requests when logged in', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('user', 'user', 3600));
    setup();

    http.get('/api/profile').subscribe();

    const req = httpMock.expectOne('/api/profile');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${authService.getToken()}`);
    req.flush({});
    httpMock.verify();
  });

  it('does not attach a header when there is no logged-in user', () => {
    setup();
    // The 401 flushed below legitimately triggers authInterceptor's own
    // navigate-to-/login behavior (tested separately below); mock it here
    // too so that real, unmocked navigation isn't left to fail against the
    // empty route table after this test has already finished.
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    http.get('/api/profile').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/profile');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock.verify();
  });

  it('does not attach the old token to the login request itself', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('user', 'user', 3600));
    setup();

    http.post('/api/auth/login', { username: 'user', password: 'user123' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ token: 'irrelevant' });
    httpMock.verify();
  });

  it('leaves requests to other, non-API URLs alone', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('user', 'user', 3600));
    setup();

    http.get('/assets/logo.png').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/assets/logo.png');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(null, { status: 404, statusText: 'Not Found' });
    httpMock.verify();
  });

  it('logs out and redirects to /login when an API request comes back 401', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('user', 'user', 3600));
    setup();
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    http.get('/api/profile').subscribe({ error: () => {} });
    httpMock.expectOne('/api/profile').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(authService.isAuthenticated()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith('/login');
    httpMock.verify();
  });

  it('leaves the user logged in for a non-401 error', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 'admin', 3600));
    setup();
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    http.get('/api/admin/stats').subscribe({ error: () => {} });
    httpMock.expectOne('/api/admin/stats').flush(null, { status: 403, statusText: 'Forbidden' });

    expect(authService.isAuthenticated()).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
    httpMock.verify();
  });
});
