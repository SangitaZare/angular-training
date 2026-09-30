import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Student } from '../models/student.model';
import { StudentsDataService } from '../services/students-data';

/**
 * Reads the :id route parameter and shows that student's details.
 *
 * Subscribes to route.paramMap (an Observable) rather than reading
 * route.snapshot once: if you navigate from /students/1 to /students/2,
 * Angular reuses this same component instance (same route, just a new
 * param) — ngOnInit does NOT run again, so a one-time snapshot read would
 * keep showing student 1's data. Subscribing picks up every param change.
 *
 * State is a signal (not a plain field) for the same reason as PostList
 * in Day 3: this app has no zone.js, so a plain field mutated inside a
 * subscribe() callback wouldn't reliably trigger a re-render.
 */
@Component({
  selector: 'app-student-detail',
  standalone: false,
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetail implements OnInit, OnDestroy {
  student = signal<Student | undefined>(undefined);
  private paramSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private studentsDataService: StudentsDataService,
  ) {}

  ngOnInit(): void {
    this.paramSubscription = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.student.set(this.studentsDataService.getById(id));
    });
  }

  ngOnDestroy(): void {
    this.paramSubscription?.unsubscribe();
  }
}
