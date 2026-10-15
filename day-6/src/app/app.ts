import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as TasksActions from './store/tasks.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTasks());
  }
}
