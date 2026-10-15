import { Component, OnInit, inject, signal } from '@angular/core';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load products.');
        this.loading.set(false);
      },
    });
  }

  remove(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => this.products.update((list) => list.filter((product) => product.id !== id)),
      error: () => this.error.set('Could not delete that product.'),
    });
  }
}
