import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

import { FeedbackForm } from './feedback-form';

describe('FeedbackForm', () => {
  let fixture: ComponentFixture<FeedbackForm>;
  let component: FeedbackForm;
  let breakpoint$: Subject<BreakpointState>;
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    breakpoint$ = new Subject<BreakpointState>();
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [FeedbackForm],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        MatButtonModule,
      ],
      providers: [
        { provide: BreakpointObserver, useValue: { observe: () => breakpoint$.asObservable() } },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates with an invalid form until required fields are filled', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('does not submit, and marks fields touched, when the form is invalid', () => {
    component.submit();

    expect(snackBar.open).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
    expect(component.submitted()).toBe(false);
  });

  it('submits, shows a confirmation, and resets the form (keeping the subscribe choice) once valid', () => {
    component.form.setValue({
      name: 'Sangita',
      email: 'sangita@example.com',
      category: 'bug',
      priority: 'high',
      message: 'Something is broken on the dashboard page.',
      subscribe: true,
    });

    component.submit();

    expect(snackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('Sangita'),
      'Close',
      expect.any(Object),
    );
    expect(component.submitted()).toBe(true);
    expect(component.form.controls.name.value).toBe('');
    expect(component.form.controls.subscribe.value).toBe(true);
  });

  it('tracks the handset breakpoint into the isHandset signal', () => {
    expect(component.isHandset()).toBe(false);

    breakpoint$.next({ matches: true, breakpoints: {} });
    expect(component.isHandset()).toBe(true);

    breakpoint$.next({ matches: false, breakpoints: {} });
    expect(component.isHandset()).toBe(false);
  });
});
