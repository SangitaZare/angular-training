import { Component } from '@angular/core';
import { Student } from './models/student.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'Day 2: Angular Templates and Pipes';

  students: Student[] = [
    { id: 1, name: 'jane doe', email: 'jane@example.com', course: 'angular fundamentals' },
    { id: 2, name: 'john smith', email: 'john@example.com', course: 'typescript basics' },
    { id: 3, name: 'amit kumar', email: 'amit@example.com', course: 'angular fundamentals' },
    { id: 4, name: 'priya sharma', email: 'priya@example.com', course: 'rxjs deep dive' },
    { id: 5, name: 'wei chen', email: 'wei@example.com', course: 'typescript basics' },
  ];
}
