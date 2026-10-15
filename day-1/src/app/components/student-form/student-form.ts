import { Component, EventEmitter, Output } from '@angular/core';
import { Student } from '../../models/student.model';

/**
 * Form component demonstrating two-way data binding with [(ngModel)].
 * Each keystroke updates the component's model instantly (input -> model)
 * and any programmatic change to the model would flow back into the
 * input (model -> input), which is what makes ngModel "two-way".
 */
@Component({
  selector: 'app-student-form',
  standalone: false,
  templateUrl: './student-form.html',
  styleUrl: './student-form.css',
})
export class StudentForm {
  name = '';
  email = '';
  course = '';

  // Event binding: notifies the parent component when a new student is submitted.
  @Output() addStudent = new EventEmitter<Omit<Student, 'id'>>();

  get isValid(): boolean {
    return this.name.trim().length > 0 && this.email.trim().length > 0;
  }

  onSubmit(): void {
    if (!this.isValid) {
      return;
    }

    this.addStudent.emit({
      name: this.name.trim(),
      email: this.email.trim(),
      course: this.course.trim() || 'Not specified',
    });

    this.name = '';
    this.email = '';
    this.course = '';
  }
}
