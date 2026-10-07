import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarRating } from './star-rating';

describe('StarRating', () => {
  let fixture: ComponentFixture<StarRating>;
  let component: StarRating;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StarRating],
    }).compileComponents();

    fixture = TestBed.createComponent(StarRating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function stars(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button.star'));
  }

  it('renders five stars', () => {
    expect(stars().length).toBe(5);
  });

  it('emits ratingChange with the value of the clicked star', () => {
    let emitted: number | undefined;
    component.ratingChange.subscribe((value) => (emitted = value));

    stars()[2].click();

    expect(emitted).toBe(3);
  });

  it('marks every star up to the current rating as filled', () => {
    fixture.componentRef.setInput('rating', 3);
    fixture.detectChanges();

    const filled = stars().filter((star) => star.classList.contains('filled'));
    expect(filled.length).toBe(3);
  });

  it('does nothing when readOnly is true', () => {
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();

    let emitted = false;
    component.ratingChange.subscribe(() => (emitted = true));
    stars()[4].click();

    expect(emitted).toBe(false);
    expect(component.rating).toBe(0);
  });
});
