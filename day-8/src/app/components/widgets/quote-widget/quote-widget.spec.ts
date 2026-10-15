import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteWidget } from './quote-widget';

describe('QuoteWidget', () => {
  let fixture: ComponentFixture<QuoteWidget>;
  let component: QuoteWidget;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoteWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows a quote at creation', () => {
    expect(component.quote().length).toBeGreaterThan(0);
  });

  it('cycles to a different quote and wraps around', () => {
    const first = component.quote();

    fixture.nativeElement.querySelector('.widget > button:last-child').click();
    fixture.detectChanges();
    expect(component.quote()).not.toBe(first);

    // Click through the rest of the list to confirm it wraps back to the first quote.
    for (let i = 0; i < 3; i++) {
      fixture.nativeElement.querySelector('.widget > button:last-child').click();
    }
    expect(component.quote()).toBe(first);
  });

  it('emits closed when the close button is clicked', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));

    fixture.nativeElement.querySelector('.close-btn').click();

    expect(emitted).toBe(true);
  });
});
