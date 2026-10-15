import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { Product } from '../../models/product';

/**
 * "Before" version of the product card — the default change detection
 * strategy. Kept side by side with `ProductCard` (the OnPush version) so
 * the two can render the same data and make the difference in how often
 * each gets checked directly visible, instead of just asserting it.
 */
@Component({
  selector: 'app-product-card-legacy',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './product-card-legacy.html',
  styleUrl: './product-card-legacy.css',
})
export class ProductCardLegacy implements DoCheck {
  @Input({ required: true }) product!: Product;
  @Output() favorite = new EventEmitter<void>();

  readonly checks = signal(0);

  // Runs on every change detection pass Angular performs for this
  // component. With the Default strategy that's every pass that reaches
  // this branch of the tree at all, whether or not `product` changed.
  ngDoCheck(): void {
    this.checks.update((c) => c + 1);
  }
}
