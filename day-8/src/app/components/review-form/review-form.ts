import { Component, signal } from '@angular/core';

import { Review } from '../../models/review';

/**
 * Parent half of the @Input/@Output pair: owns the list of submitted
 * reviews and the in-progress draft, passes `rating` down into each
 * <app-star-rating>, and listens for `ratingChange` to update the draft.
 */
@Component({
  selector: 'app-review-form',
  standalone: false,
  templateUrl: './review-form.html',
  styleUrl: './review-form.css',
})
export class ReviewForm {
  readonly reviews = signal<Review[]>([]);
  draftRating = 0;
  draftComment = '';

  private nextId = 1;

  get canSubmit(): boolean {
    return this.draftRating > 0 && this.draftComment.trim().length > 0;
  }

  setRating(value: number): void {
    this.draftRating = value;
  }

  onCommentInput(event: Event): void {
    this.draftComment = (event.target as HTMLTextAreaElement).value;
  }

  submit(): void {
    if (!this.canSubmit) {
      return;
    }

    this.reviews.update((list) => [
      ...list,
      { id: this.nextId++, rating: this.draftRating, comment: this.draftComment.trim() },
    ]);
    this.draftRating = 0;
    this.draftComment = '';
  }
}
