import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { App } from './app';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { PostList } from './components/post-list/post-list';

@NgModule({
  declarations: [App, Header, Footer, PostList],
  imports: [BrowserModule],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
