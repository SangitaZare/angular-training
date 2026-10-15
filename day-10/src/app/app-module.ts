import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { App } from './app';
import { ProductForm } from './components/product-form/product-form';
import { ProductList } from './components/product-list/product-list';
import { mockBackendInterceptor } from './mock-backend.interceptor';

@NgModule({
  declarations: [App, ProductList, ProductForm],
  imports: [BrowserModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([mockBackendInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
