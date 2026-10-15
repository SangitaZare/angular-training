import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterWidget } from './counter-widget';

describe('CounterWidget', () => {
  let fixture: ComponentFixture<CounterWidget>;
  let component: CounterWidget;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts at zero', () => {
    expect(component.count()).toBe(0);
  });

  it('increments and decrements by the configured step', () => {
    fixture.componentRef.setInput('step', 5);
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('.actions button')[1].click();
    expect(component.count()).toBe(5);

    fixture.nativeElement.querySelectorAll('.actions button')[0].click();
    expect(component.count()).toBe(0);
  });

  it('emits closed when the close button is clicked', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));

    fixture.nativeElement.querySelector('.close-btn').click();

    expect(emitted).toBe(true);
  });
});
