import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import * as TasksActions from '../../store/tasks.actions';
import { selectActiveCount, selectAllTasks, selectCompletedCount } from '../../store/tasks.selectors';

type Filter = 'all' | 'active' | 'completed';

/**
 * Reads store state via selectSignal rather than the async pipe: this
 * app (like the earlier days) runs zoneless, and a signal re-renders the
 * same way any other signal read does, with no subscribe/unsubscribe or
 * OnPush-via-async-pipe plumbing needed in the template.
 */
@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  private readonly store = inject(Store);

  private readonly allTasks = this.store.selectSignal(selectAllTasks);
  readonly activeCount = this.store.selectSignal(selectActiveCount);
  readonly completedCount = this.store.selectSignal(selectCompletedCount);

  readonly filter = signal<Filter>('all');
  readonly newTitle = signal('');

  readonly visibleTasks = computed(() => {
    const tasks = this.allTasks();
    switch (this.filter()) {
      case 'active':
        return tasks.filter((task) => !task.completed);
      case 'completed':
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  });

  addTask(): void {
    const title = this.newTitle().trim();
    if (!title) return;
    this.store.dispatch(TasksActions.addTask({ title }));
    this.newTitle.set('');
  }

  toggleTask(id: string): void {
    this.store.dispatch(TasksActions.toggleTask({ id }));
  }

  removeTask(id: string): void {
    this.store.dispatch(TasksActions.removeTask({ id }));
  }

  clearCompleted(): void {
    this.store.dispatch(TasksActions.clearCompleted());
  }

  setFilter(filter: Filter): void {
    this.filter.set(filter);
  }
}
