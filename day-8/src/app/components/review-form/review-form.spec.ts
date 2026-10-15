import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ReviewForm } from './review-form';
import { Panel } from '../panel/panel';
import { StarRating } from '../star-rating/star-rating';

describe('ReviewForm', () => {
  let fixture: ComponentFixture<ReviewForm>;
  let component: ReviewForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewForm, Panel, StarRating],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function submitBtn(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.submit-btn');
  }

  function draftStars(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('app-star-rating button.star'));
  }

  function typeComment(text: string): void {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('.comment-input');
    textarea.value = text;
    textarea.dispatchEvent(new Event('input'));
  }

  // Interact through real DOM events (star clicks, input events) rather than
  // mutating component fields directly — that's what actually drives Angular's
  // zoneless change-detection scheduler, the same way a real user would.
  it('disables submit until both a rating and a comment are present', () => {
    expect(submitBtn().disabled).toBe(true);

    draftStars()[3].click();
    fixture.detectChanges();
    expect(submitBtn().disabled).toBe(true);

    typeComment('Great course');
    fixture.detectChanges();
    expect(submitBtn().disabled).toBe(false);
  });

  it("updates the draft rating when the child star-rating's ratingChange fires", () => {
    const starRating = fixture.debugElement.query(By.directive(StarRating));
    (starRating.componentInstance as StarRating).ratingChange.emit(5);

    expect(component.draftRating).toBe(5);
  });

  it('adds a review and resets the composer on submit', () => {
    draftStars()[4].click();
    typeComment('Loved it');
    fixture.detectChanges();

    submitBtn().click();
    fixture.detectChanges();

    expect(component.reviews()).toEqual([{ id: 1, rating: 5, comment: 'Loved it' }]);
    expect(component.draftRating).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.review-item').length).toBe(1);
  });

  it('ignores a submit when the comment is only whitespace', () => {
    component.setRating(3);
    component.onCommentInput({ target: { value: '   ' } } as unknown as Event);

    component.submit();

    expect(component.reviews()).toEqual([]);
  });
});
