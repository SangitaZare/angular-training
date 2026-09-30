import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { App } from './app';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { StudentForm } from './components/student-form/student-form';
import { StudentCard } from './components/student-card/student-card';
import { Highlight } from './directives/highlight';

@NgModule({
  declarations: [App, Header, Footer, StudentForm, StudentCard, Highlight],
  imports: [BrowserModule, FormsModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
