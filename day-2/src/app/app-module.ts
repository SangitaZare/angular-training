import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { App } from './app';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { StudentList } from './components/student-list/student-list';
import { CapitalizePipe } from './pipes/capitalize-pipe';
import { FilterByNamePipe } from './pipes/filter-by-name-pipe';

@NgModule({
  declarations: [App, Header, Footer, StudentList, CapitalizePipe, FilterByNamePipe],
  imports: [BrowserModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
