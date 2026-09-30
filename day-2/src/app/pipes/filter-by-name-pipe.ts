import { Pipe, PipeTransform } from '@angular/core';
import { Student } from '../models/student.model';

/**
 * Custom pipe that filters a list of students by a case-insensitive
 * match against the student's name.
 *
 * Usage: *ngFor="let s of students | filterByName:searchTerm"
 */
@Pipe({
  name: 'filterByName',
  standalone: false,
})
export class FilterByNamePipe implements PipeTransform {
  transform(students: Student[] | null | undefined, searchTerm: string): Student[] {
    if (!students) {
      return [];
    }
    if (!searchTerm) {
      return students;
    }

    const term = searchTerm.toLowerCase();
    return students.filter((student) => student.name.toLowerCase().includes(term));
  }
}
