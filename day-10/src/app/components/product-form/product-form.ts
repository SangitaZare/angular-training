import { Component, EventEmitter, Output, inject, signal } from '@angular/core';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  private readonly productService = inject(ProductService);

  @Output() readonly added = new EventEmitter<Product>();

  name = '';
  price: number | null = null;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  get canSubmit(): boolean {
    return this.name.trim().length > 0 && !!this.price && this.price > 0 && !this.submitting();
  }

  onNameInput(event: Event): void {
    this.name = (event.target as HTMLInputElement).value;
  }

  onPriceInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.price = value === '' ? null : Number(value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.productService.addProduct({ name: this.name.trim(), price: this.price! }).subscribe({
      next: (product) => {
        this.submitting.set(false);
        this.name = '';
        this.price = null;
        this.added.emit(product);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Could not add that product.');
      },
    });
  }
}
