import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { ClosableWidget } from '../../../models/widget';

@Component({
  selector: 'app-counter-widget',
  standalone: false,
  templateUrl: './counter-widget.html',
  styleUrl: './counter-widget.css',
})
export class CounterWidget implements ClosableWidget {
  @Input() step = 1;
  @Output() closed = new EventEmitter<void>();

  readonly count = signal(0);

  increment(): void {
    this.count.update((c) => c + this.step);
  }

  decrement(): void {
    this.count.update((c) => c - this.step);
  }
}
