import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Admin } from './admin';
import { AuthService } from '../../services/auth';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Admin],
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should log out via AuthService when the Log Out button is clicked', () => {
    authService.login();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(authService.isLoggedIn()).toBe(false);
  });
});
