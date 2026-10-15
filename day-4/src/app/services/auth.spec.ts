import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start logged out', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should log in', () => {
    service.login();
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should log out', () => {
    service.login();
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
  });
});
