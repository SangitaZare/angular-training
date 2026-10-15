import { Component } from '@angular/core';
import { Student } from './models/student.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'Day 1: Angular Architecture and Components';

  lastStudent: Student | null = null;
  private nextId = 1;

  // Handles the (addStudent) event emitted by <app-student-form>
  onAddStudent(newStudent: Omit<Student, 'id'>): void {
    this.lastStudent = { id: this.nextId++, ...newStudent };
  }
}
