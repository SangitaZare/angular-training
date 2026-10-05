import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

export const TASKS_STORAGE_KEY = 'day6.tasks';

/**
 * Thin wrapper around localStorage so the persistence effect doesn't need
 * to know the storage key or handle parse/write errors itself — private
 * browsing, a full quota, or a corrupted value can all make localStorage
 * throw, and a failure here shouldn't crash the app, just skip persisting.
 */
@Injectable({ providedIn: 'root' })
export class TasksStorageService {
  load(): Task[] {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  }

  save(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Swallow: state still works for the rest of the session, it just
      // won't survive a reload.
    }
  }
}
