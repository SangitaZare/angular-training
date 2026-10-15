import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TaskList } from './task-list';
import * as TasksActions from '../../store/tasks.actions';
import { selectActiveCount, selectAllTasks, selectCompletedCount } from '../../store/tasks.selectors';

describe('TaskList', () => {
  let component: TaskList;
  let fixture: ComponentFixture<TaskList>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskList],
      imports: [FormsModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAllTasks, value: [] },
            { selector: selectActiveCount, value: 0 },
            { selector: selectCompletedCount, value: 0 },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(TaskList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dispatches addTask with the trimmed title and clears the input', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.newTitle.set('  Buy milk  ');

    component.addTask();

    expect(dispatchSpy).toHaveBeenCalledWith(TasksActions.addTask({ title: 'Buy milk' }));
    expect(component.newTitle()).toBe('');
  });

  it('does not dispatch when the title is blank', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.newTitle.set('   ');

    component.addTask();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('dispatches toggleTask / removeTask / clearCompleted with the right ids', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.toggleTask('1');
    expect(dispatchSpy).toHaveBeenCalledWith(TasksActions.toggleTask({ id: '1' }));

    component.removeTask('1');
    expect(dispatchSpy).toHaveBeenCalledWith(TasksActions.removeTask({ id: '1' }));

    component.clearCompleted();
    expect(dispatchSpy).toHaveBeenCalledWith(TasksActions.clearCompleted());
  });

  it('filters visibleTasks by the selected filter', () => {
    store.overrideSelector(selectAllTasks, [
      { id: '1', title: 'Buy milk', completed: true },
      { id: '2', title: 'Walk dog', completed: false },
    ]);
    store.refreshState();
    fixture.detectChanges();

    component.setFilter('active');
    expect(component.visibleTasks().map((t) => t.id)).toEqual(['2']);

    component.setFilter('completed');
    expect(component.visibleTasks().map((t) => t.id)).toEqual(['1']);

    component.setFilter('all');
    expect(component.visibleTasks().map((t) => t.id)).toEqual(['1', '2']);
  });
});
