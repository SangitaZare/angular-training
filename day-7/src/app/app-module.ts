import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { App } from './app';
import { ProductDashboard } from './components/product-dashboard/product-dashboard';
import { ProductCard } from './components/product-card/product-card';
import { ProductCardLegacy } from './components/product-card-legacy/product-card-legacy';
import { FeedbackForm } from './components/feedback-form/feedback-form';

@NgModule({
  declarations: [App, ProductDashboard, ProductCard, ProductCardLegacy, FeedbackForm],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  providers: [provideBrowserGlobalErrorListeners(), provideAnimationsAsync()],
  bootstrap: [App],
})
export class AppModule {}
