import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockWidget } from './clock-widget';

describe('ClockWidget', () => {
  let fixture: ComponentFixture<ClockWidget>;
  let component: ClockWidget;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00'));

    await TestBed.configureTestingModule({
      declarations: [ClockWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(ClockWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the time at creation', () => {
    expect(component.time()).toBe(new Date('2026-01-01T10:00:00').toLocaleTimeString());
  });

  it('ticks forward once a second', () => {
    vi.advanceTimersByTime(1000);

    expect(component.time()).toBe(new Date('2026-01-01T10:00:01').toLocaleTimeString());
  });

  it('stops ticking once the component is destroyed', () => {
    fixture.destroy();
    const before = component.time();

    vi.setSystemTime(new Date('2026-01-01T10:05:00'));
    vi.advanceTimersByTime(5000);

    expect(component.time()).toBe(before);
  });

  it('emits closed when the close button is clicked', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));

    fixture.nativeElement.querySelector('.close-btn').click();

    expect(emitted).toBe(true);
  });
});
