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
 * "After" version of the product card — refactored to `OnPush`. With this
 * strategy Angular only checks this component when one of its @Input()
 * references changes, an event originates from inside it (the favorite
 * button), or it's explicitly marked for check — never just because a CD
 * pass swept through from an unrelated signal changing elsewhere in the
 * tree (see `ActivityTicker`, read by the sibling `ProductDashboard`).
 */
@Component({
  selector: 'app-product-card',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard implements DoCheck {
  @Input({ required: true }) product!: Product;
  @Output() favorite = new EventEmitter<void>();

  readonly checks = signal(0);

  ngDoCheck(): void {
    this.checks.update((c) => c + 1);
  }
}
