import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { StudentForm } from './student-form';
import { Highlight } from '../../directives/highlight';

describe('StudentForm', () => {
  let component: StudentForm;
  let fixture: ComponentFixture<StudentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [StudentForm, Highlight],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid until name and email are filled in', () => {
    expect(component.isValid).toBe(false);
    component.name = 'Jane';
    component.email = 'jane@example.com';
    expect(component.isValid).toBe(true);
  });

  it('should emit addStudent and reset the form on submit', () => {
    component.name = 'Jane';
    component.email = 'jane@example.com';
    component.course = 'Angular';

    let emitted: unknown;
    component.addStudent.subscribe((value) => (emitted = value));

    component.onSubmit();

    expect(emitted).toEqual({ name: 'Jane', email: 'jane@example.com', course: 'Angular' });
    expect(component.name).toBe('');
    expect(component.email).toBe('');
  });

  it('should not emit when the form is invalid', () => {
    let emitted = false;
    component.addStudent.subscribe(() => (emitted = true));

    component.onSubmit();

    expect(emitted).toBe(false);
  });
});
