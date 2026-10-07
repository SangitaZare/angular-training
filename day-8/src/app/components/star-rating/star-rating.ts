import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * A reusable child component. `rating` flows down via @Input; a pick flows
 * back up via @Output. Naming the output `ratingChange` to match the input
 * name is what lets a parent use the `[(rating)]="x"` banana-in-a-box
 * shorthand instead of `[rating]="x" (ratingChange)="x = $event"`.
 */
@Component({
  selector: 'app-star-rating',
  standalone: false,
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
})
export class StarRating {
  @Input() rating = 0;
  @Input() readOnly = false;
  @Output() ratingChange = new EventEmitter<number>();

  readonly stars = [1, 2, 3, 4, 5];

  choose(value: number): void {
    if (this.readOnly || value === this.rating) {
      return;
    }
    this.rating = value;
    this.ratingChange.emit(value);
  }
}
