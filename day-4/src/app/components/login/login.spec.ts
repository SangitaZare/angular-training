import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { Login } from './login';
import { AuthService } from '../../services/auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: AuthService;
  let routerSpy: { navigateByUrl: ReturnType<typeof vi.fn> };

  function setup(returnUrl?: string) {
    routerSpy = { navigateByUrl: vi.fn() };

    TestBed.configureTestingModule({
      declarations: [Login],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  }

  it('should create', () => {
    setup();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should log in and navigate to the returnUrl when one is present', () => {
    setup('/admin');
    fixture.detectChanges();

    component.onLogin();

    expect(authService.isLoggedIn()).toBe(true);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('should default to / when there is no returnUrl', () => {
    setup();
    fixture.detectChanges();

    component.onLogin();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
