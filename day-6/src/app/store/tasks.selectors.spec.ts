import { TasksState } from './tasks.reducer';
import {
  selectActiveCount,
  selectActiveTasks,
  selectAllTasks,
  selectCompletedCount,
  selectCompletedTasks,
  selectTasksLoaded,
} from './tasks.selectors';

describe('tasks selectors', () => {
  const state: { tasks: TasksState } = {
    tasks: {
      loaded: true,
      tasks: [
        { id: '1', title: 'Buy milk', completed: true },
        { id: '2', title: 'Walk dog', completed: false },
        { id: '3', title: 'Pay bills', completed: false },
      ],
    },
  };

  it('selectAllTasks returns every task', () => {
    expect(selectAllTasks(state)).toHaveLength(3);
  });

  it('selectTasksLoaded reads the loaded flag', () => {
    expect(selectTasksLoaded(state)).toBe(true);
  });

  it('selectActiveTasks / selectCompletedTasks partition by completed', () => {
    expect(selectActiveTasks(state).map((t) => t.id)).toEqual(['2', '3']);
    expect(selectCompletedTasks(state).map((t) => t.id)).toEqual(['1']);
  });

  it('selectActiveCount / selectCompletedCount count each partition', () => {
    expect(selectActiveCount(state)).toBe(2);
    expect(selectCompletedCount(state)).toBe(1);
  });
});
