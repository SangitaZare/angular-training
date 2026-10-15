import { Component, Input } from '@angular/core';
import { Student } from '../../models/student.model';

/**
 * Renders a dynamic, filterable list of students.
 *
 * Deliberately avoids ngModel/FormsModule (a Day 1 topic) — the search box
 * uses plain event binding, (input), and property binding, [value], to stay
 * scoped to this project's syllabus: template syntax, *ngIf/*ngFor, pipes.
 */
@Component({
  selector: 'app-student-list',
  standalone: false,
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
})
export class StudentList {
  @Input() students: Student[] = [];

  searchTerm = '';
  // Tracks which single row (by id) has its details panel open.
  expandedId: number | null = null;

  // Event binding target for the search box's (input) event.
  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  toggleDetails(student: Student): void {
    this.expandedId = this.expandedId === student.id ? null : student.id;
  }

  trackById(index: number, student: Student): number {
    return student.id;
  }
}
