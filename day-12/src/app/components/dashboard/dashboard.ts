import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { AuthService } from '../../auth/auth.service';
import * as ProjectsActions from '../../store/projects/projects.actions';
import {
  selectActiveCount,
  selectAllProjects,
  selectCompletedCount,
  selectOnHoldCount,
  selectProjectsError,
  selectProjectsLoading,
  selectTotalCount,
} from '../../store/projects/projects.selectors';

/**
 * Reads store state via selectSignal rather than the async pipe, the same
 * approach Day 6's TaskList used: this app runs zoneless, so a signal
 * re-renders the template the same way any other signal read does, with no
 * subscribe/unsubscribe plumbing needed here.
 */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  readonly auth = inject(AuthService);
  private readonly store = inject(Store);

  readonly projects = this.store.selectSignal(selectAllProjects);
  readonly loading = this.store.selectSignal(selectProjectsLoading);
  readonly error = this.store.selectSignal(selectProjectsError);
  readonly totalCount = this.store.selectSignal(selectTotalCount);
  readonly activeCount = this.store.selectSignal(selectActiveCount);
  readonly completedCount = this.store.selectSignal(selectCompletedCount);
  readonly onHoldCount = this.store.selectSignal(selectOnHoldCount);

  readonly displayedColumns = ['name', 'owner', 'status', 'updatedAt', 'actions'];

  ngOnInit(): void {
    this.store.dispatch(ProjectsActions.loadProjects());
  }

  toggleStatus(id: string): void {
    this.store.dispatch(ProjectsActions.toggleProjectStatus({ id }));
  }

  remove(id: string): void {
    this.store.dispatch(ProjectsActions.removeProject({ id }));
  }
}
