import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicLoader } from './dynamic-loader';
import { Panel } from '../panel/panel';
import { CounterWidget } from '../widgets/counter-widget/counter-widget';
import { ClockWidget } from '../widgets/clock-widget/clock-widget';
import { QuoteWidget } from '../widgets/quote-widget/quote-widget';

describe('DynamicLoader', () => {
  let fixture: ComponentFixture<DynamicLoader>;
  let component: DynamicLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DynamicLoader, Panel, CounterWidget, ClockWidget, QuoteWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function clickAdd(): void {
    fixture.nativeElement.querySelector('.add-btn').click();
    fixture.detectChanges();
  }

  it('creates a counter widget by default, configured with the step input', () => {
    clickAdd();

    const widget = fixture.nativeElement.querySelector('app-counter-widget');
    expect(widget).toBeTruthy();
    expect(widget.querySelector('.actions button:last-child').textContent).toContain('+5');
    expect(component.widgetCount()).toBe(1);
  });

  it('creates whichever widget type the user picked from the select', () => {
    component.onTypeChange({ target: { value: 'quote' } } as unknown as Event);
    clickAdd();

    expect(fixture.nativeElement.querySelector('app-quote-widget')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-counter-widget')).toBeFalsy();
  });

  it('supports loading several widgets side by side', () => {
    clickAdd();
    component.onTypeChange({ target: { value: 'clock' } } as unknown as Event);
    clickAdd();

    expect(component.widgetCount()).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.widget').length).toBe(2);
  });

  it("removes a widget via its own @Output and decrements the count", () => {
    clickAdd();

    fixture.nativeElement.querySelector('.close-btn').click();
    fixture.detectChanges();

    expect(component.widgetCount()).toBe(0);
    expect(fixture.nativeElement.querySelector('.widget')).toBeFalsy();
  });

  it('clears every loaded widget at once', () => {
    clickAdd();
    clickAdd();
    expect(component.widgetCount()).toBe(2);

    fixture.nativeElement.querySelector('.clear-btn').click();
    fixture.detectChanges();

    expect(component.widgetCount()).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.widget').length).toBe(0);
  });

  it('disables "Clear all" when there is nothing loaded', () => {
    const clearBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.clear-btn');
    expect(clearBtn.disabled).toBe(true);

    clickAdd();
    expect(clearBtn.disabled).toBe(false);
  });
});
