import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { RegistrationForm } from './registration-form';

describe('RegistrationForm', () => {
  let component: RegistrationForm;
  let fixture: ComponentFixture<RegistrationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegistrationForm],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should flag an email that fails the custom emailFormat validator', () => {
    component.email.setValue('not-an-email');
    expect(component.email.errors?.['emailFormat']).toBe(true);

    component.email.setValue('user@example.com');
    expect(component.email.errors).toBeNull();
  });

  it('should flag a weak password via the custom passwordStrength validator', () => {
    component.password.setValue('weak');
    expect(component.password.errors?.['passwordStrength']).toEqual(
      expect.objectContaining({ minLength: true, upperCase: true, digit: true, specialChar: true }),
    );

    component.password.setValue('Str0ng!Pass');
    expect(component.password.errors).toBeNull();
  });

  it('should flag mismatched passwords at the group level', () => {
    component.password.setValue('Str0ng!Pass');
    component.confirmPassword.setValue('Different1!');
    expect(component.form.errors?.['passwordsMismatch']).toBe(true);

    component.confirmPassword.setValue('Str0ng!Pass');
    expect(component.form.errors).toBeNull();
  });

  it('should not submit an invalid form', () => {
    component.onSubmit();
    expect(component.submitted()).toBe(true);
    expect(component.registeredUsername()).toBeNull();
    expect(component.username.touched).toBe(true);
  });

  it('should register and reset the form when all fields are valid', () => {
    component.username.setValue('sangita');
    component.email.setValue('sangita@example.com');
    component.password.setValue('Str0ng!Pass');
    component.confirmPassword.setValue('Str0ng!Pass');

    component.onSubmit();

    expect(component.registeredUsername()).toBe('sangita');
    expect(component.username.value).toBeNull();
  });
});
