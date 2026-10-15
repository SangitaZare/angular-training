import { Component } from '@angular/core';
import { Student } from '../models/student.model';
import { StudentsDataService } from '../services/students-data';

@Component({
  selector: 'app-student-list',
  standalone: false,
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
})
export class StudentList {
  students: Student[];

  constructor(private studentsDataService: StudentsDataService) {
    this.students = this.studentsDataService.getAll();
  }
}
