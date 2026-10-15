import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivityTicker } from '../../services/activity-ticker';
import { Product } from '../../models/product';

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Mechanical Keyboard', price: 79, stock: 14, favorite: false },
  { id: 2, name: 'Wireless Mouse', price: 29, stock: 32, favorite: true },
  { id: 3, name: 'USB-C Hub', price: 39, stock: 0, favorite: false },
];

@Component({
  selector: 'app-product-dashboard',
  standalone: false,
  templateUrl: './product-dashboard.html',
  styleUrl: './product-dashboard.css',
})
export class ProductDashboard implements OnInit, OnDestroy {
  readonly ticker = inject(ActivityTicker);

  readonly products = signal<Product[]>(INITIAL_PRODUCTS);

  private renameCount = 0;

  ngOnInit(): void {
    // Represents real background app activity (a notification count, a
    // websocket heartbeat) that has nothing to do with these cards but
    // still runs change detection through this part of the tree.
    this.ticker.start();
  }

  ngOnDestroy(): void {
    this.ticker.stop();
  }

  toggleFavorite(id: number): void {
    this.products.update((list) =>
      list.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)),
    );
  }

  mutateFirstProductInPlace(): void {
    // Deliberately buggy: mutates the existing object/array in place
    // instead of writing through the signal, so no new reference is ever
    // produced. The Default-strategy card will still pick this up next
    // time it happens to be checked; the OnPush card won't notice at all.
    const list = this.products();
    if (list.length > 0) {
      list[0].name = `Mutated in place (${new Date().toLocaleTimeString()})`;
    }
  }

  renameFirstProductImmutably(): void {
    this.renameCount++;
    const count = this.renameCount;
    this.products.update((list) =>
      list.map((p, i) => (i === 0 ? { ...p, name: `Renamed immutably #${count}` } : p)),
    );
  }
}
