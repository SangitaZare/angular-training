import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginForm } from './components/login-form/login-form';
import { Dashboard } from './components/dashboard/dashboard';
import { AdminPanel } from './components/admin-panel/admin-panel';
import { authInterceptor } from './auth/auth.interceptor';
import { mockBackendInterceptor } from './auth/mock-backend.interceptor';

@NgModule({
  declarations: [App, LoginForm, Dashboard, AdminPanel],
  imports: [BrowserModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    // authInterceptor runs first so it can attach a token to the outgoing
    // request before mockBackendInterceptor (standing in for a real server)
    // checks for one.
    provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
