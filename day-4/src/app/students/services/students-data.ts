import { Injectable } from '@angular/core';
import { Student } from '../models/student.model';

const STUDENTS: Student[] = [
  { id: 1, name: 'Jane Doe', course: 'Angular Fundamentals' },
  { id: 2, name: 'John Smith', course: 'TypeScript Basics' },
  { id: 3, name: 'Amit Kumar', course: 'RxJS Deep Dive' },
];

@Injectable({
  providedIn: 'root',
})
export class StudentsDataService {
  getAll(): Student[] {
    return STUDENTS;
  }

  getById(id: number): Student | undefined {
    return STUDENTS.find((student) => student.id === id);
  }
}
