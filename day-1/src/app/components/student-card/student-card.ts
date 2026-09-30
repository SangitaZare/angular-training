import { Component, Input } from '@angular/core';
import { Student } from '../../models/student.model';

/**
 * Shows the most recently submitted student. Deliberately uses only
 * interpolation and property binding (no *ngIf/*ngFor) to keep this
 * project scoped to Day 1 topics; the fallback text below covers the
 * "nothing submitted yet" case without a structural directive.
 */
@Component({
  selector: 'app-student-card',
  standalone: false,
  templateUrl: './student-card.html',
  styleUrl: './student-card.css',
})
export class StudentCard {
  @Input() student: Student | null = null;
}
