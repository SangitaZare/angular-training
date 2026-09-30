import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow activation when logged in', () => {
    authService.login();

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/admin' } as RouterStateSnapshot,
    );

    expect(result).toBe(true);
  });

  it('should redirect to /login with a returnUrl when not logged in', () => {
    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/admin' } as RouterStateSnapshot,
    );

    expect(result).not.toBe(true);
    const tree = result as UrlTree;
    expect(tree.toString()).toContain('/login');
    expect(tree.queryParams['returnUrl']).toBe('/admin');
  });
});
