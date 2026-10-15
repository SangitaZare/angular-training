import { Component, Type, ViewChild, ViewContainerRef, signal } from '@angular/core';

import { ClosableWidget } from '../../models/widget';
import { CounterWidget } from '../widgets/counter-widget/counter-widget';
import { ClockWidget } from '../widgets/clock-widget/clock-widget';
import { QuoteWidget } from '../widgets/quote-widget/quote-widget';

interface WidgetOption {
  readonly value: string;
  readonly label: string;
  readonly component: Type<ClosableWidget>;
}

const WIDGET_OPTIONS: readonly WidgetOption[] = [
  { value: 'counter', label: 'Counter', component: CounterWidget },
  { value: 'clock', label: 'Clock', component: ClockWidget },
  { value: 'quote', label: 'Quote', component: QuoteWidget },
];

/**
 * Task 1: a component loaded dynamically based on user input. The widget
 * type comes from a <select> at runtime, so there is no `*ngIf`/`@switch`
 * branch in the template for each one — `ViewContainerRef.createComponent()`
 * instantiates whichever class the user picked straight from the registry
 * above. Because the result has no template binding site, @Input is set
 * imperatively (`setInput`) and @Output is read by subscribing directly
 * on the instance instead of a `(closed)="..."` template binding.
 */
@Component({
  selector: 'app-dynamic-loader',
  standalone: false,
  templateUrl: './dynamic-loader.html',
  styleUrl: './dynamic-loader.css',
})
export class DynamicLoader {
  @ViewChild('outlet', { read: ViewContainerRef }) private outlet!: ViewContainerRef;

  readonly options = WIDGET_OPTIONS;
  readonly widgetCount = signal(0);

  selectedType = WIDGET_OPTIONS[0].value;

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
  }

  addWidget(): void {
    const option = this.options.find((candidate) => candidate.value === this.selectedType);
    if (!option) {
      return;
    }

    const ref = this.outlet.createComponent(option.component);
    if (option.value === 'counter') {
      ref.setInput('step', 5);
    }
    this.widgetCount.update((n) => n + 1);

    ref.instance.closed.subscribe(() => {
      ref.destroy();
      this.widgetCount.update((n) => n - 1);
    });
  }

  clearAll(): void {
    this.outlet.clear();
    this.widgetCount.set(0);
  }
}
