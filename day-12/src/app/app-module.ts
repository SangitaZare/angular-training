import { isDevMode, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginForm } from './components/login-form/login-form';
import { Dashboard } from './components/dashboard/dashboard';
import { QrShare } from './components/qr-share/qr-share';

import { authInterceptor } from './auth/auth.interceptor';
import { mockBackendInterceptor } from './auth/mock-backend.interceptor';
import { projectsReducer } from './store/projects/projects.reducer';
import { ProjectsEffects } from './store/projects/projects.effects';

@NgModule({
  declarations: [App, LoginForm, Dashboard, QrShare],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    // 'projects' here is the slice name read back by createFeatureSelector('projects')
    // in projects.selectors.ts.
    StoreModule.forRoot({ projects: projectsReducer }),
    EffectsModule.forRoot([ProjectsEffects]),
    // Lets the Redux DevTools browser extension inspect every dispatched
    // action and the resulting state tree — logOnly disables it outside
    // dev builds so it isn't shipped to production.
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    // authInterceptor runs first so it can attach a token to the outgoing
    // request before mockBackendInterceptor (standing in for a real server)
    // checks for one.
    provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
