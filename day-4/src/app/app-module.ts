import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Home } from './components/home/home';
import { Admin } from './components/admin/admin';
import { Login } from './components/login/login';
import { PageNotFound } from './components/page-not-found/page-not-found';

@NgModule({
  declarations: [App, Home, Admin, Login, PageNotFound],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
