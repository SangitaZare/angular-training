import { isDevMode, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { App } from './app';
import { TaskList } from './components/task-list/task-list';
import { tasksReducer } from './store/tasks.reducer';
import { TasksEffects } from './store/tasks.effects';

@NgModule({
  declarations: [App, TaskList],
  imports: [
    BrowserModule,
    FormsModule,
    // 'tasks' here is the slice name read back by selectFeatureSelector('tasks')
    // in tasks.selectors.ts.
    StoreModule.forRoot({ tasks: tasksReducer }),
    EffectsModule.forRoot([TasksEffects]),
    // Lets the Redux DevTools browser extension inspect every dispatched
    // action and the resulting state tree — logOnly disables it outside
    // dev builds so it isn't shipped to production.
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
