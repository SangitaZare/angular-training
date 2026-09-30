import { Component } from '@angular/core';

/**
 * Parent for the students feature's child routes. Provides a shared
 * heading, and its own <router-outlet> swaps between StudentList (path '')
 * and StudentDetail (path ':id') as the URL changes underneath /students.
 */
@Component({
  selector: 'app-students-shell',
  standalone: false,
  templateUrl: './students-shell.html',
  styleUrl: './students-shell.css',
})
export class StudentsShell {}
