import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { roleGuard } from './role.guard';
import { TOKEN_KEY } from './auth.service';
import { createMockJwt } from './jwt';

function routeWithRoles(roles?: string[]): ActivatedRouteSnapshot {
  return { data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot;
}

describe('roleGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("allows a user whose role is in the route's allowed list", () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 'admin', 3600));

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['admin']), {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it("redirects to /dashboard when the user's role is not allowed", () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('user', 'user', 3600));

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['admin']), {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/dashboard');
  });

  it('redirects to /dashboard when nobody is logged in', () => {
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['admin']), {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
  });

  it('allows through when the route declares no role restriction', () => {
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(), {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });
});
