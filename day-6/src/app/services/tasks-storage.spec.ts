import { Task } from '../models/task.model';
import { TASKS_STORAGE_KEY, TasksStorageService } from './tasks-storage';

describe('TasksStorageService', () => {
  let service: TasksStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new TasksStorageService();
  });

  it('returns an empty array when nothing has been saved', () => {
    expect(service.load()).toEqual([]);
  });

  it('round-trips tasks through save/load', () => {
    const tasks: Task[] = [{ id: '1', title: 'Buy milk', completed: false }];
    service.save(tasks);
    expect(service.load()).toEqual(tasks);
  });

  it('returns an empty array when the stored value is corrupted JSON', () => {
    localStorage.setItem(TASKS_STORAGE_KEY, '{not valid json');
    expect(service.load()).toEqual([]);
  });
});
