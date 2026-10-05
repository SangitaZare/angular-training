import { Task } from '../models/task.model';
import * as TasksActions from './tasks.actions';
import { initialState, tasksReducer, TasksState } from './tasks.reducer';

describe('tasksReducer', () => {
  it('returns the initial state for an unknown action', () => {
    const state = tasksReducer(undefined, { type: '[Test] Unknown' });
    expect(state).toEqual(initialState);
  });

  it('loads tasks and marks the state as loaded on Load Tasks Success', () => {
    const tasks: Task[] = [{ id: '1', title: 'Buy milk', completed: false }];
    const state = tasksReducer(initialState, TasksActions.loadTasksSuccess({ tasks }));
    expect(state).toEqual({ tasks, loaded: true });
  });

  it('appends a new, incomplete task on Add Task', () => {
    const state = tasksReducer(initialState, TasksActions.addTask({ title: 'Buy milk' }));
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0]).toMatchObject({ title: 'Buy milk', completed: false });
    expect(state.tasks[0].id).toBeTruthy();
  });

  it('flips only the matching task on Toggle Task', () => {
    const seeded: TasksState = {
      loaded: true,
      tasks: [
        { id: '1', title: 'Buy milk', completed: false },
        { id: '2', title: 'Walk dog', completed: false },
      ],
    };

    const state = tasksReducer(seeded, TasksActions.toggleTask({ id: '1' }));

    expect(state.tasks[0].completed).toBe(true);
    expect(state.tasks[1].completed).toBe(false);
  });

  it('removes only the matching task on Remove Task', () => {
    const seeded: TasksState = {
      loaded: true,
      tasks: [
        { id: '1', title: 'Buy milk', completed: false },
        { id: '2', title: 'Walk dog', completed: false },
      ],
    };

    const state = tasksReducer(seeded, TasksActions.removeTask({ id: '1' }));

    expect(state.tasks).toEqual([{ id: '2', title: 'Walk dog', completed: false }]);
  });

  it('drops every completed task on Clear Completed, keeping active ones', () => {
    const seeded: TasksState = {
      loaded: true,
      tasks: [
        { id: '1', title: 'Buy milk', completed: true },
        { id: '2', title: 'Walk dog', completed: false },
      ],
    };

    const state = tasksReducer(seeded, TasksActions.clearCompleted());

    expect(state.tasks).toEqual([{ id: '2', title: 'Walk dog', completed: false }]);
  });
});
