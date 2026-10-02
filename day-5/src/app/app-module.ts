import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { App } from './app';
import { RegistrationForm } from './components/registration-form/registration-form';
import { ContactForm } from './components/contact-form/contact-form';

@NgModule({
  declarations: [App, RegistrationForm, ContactForm],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
