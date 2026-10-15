import { Component, DestroyRef, EventEmitter, Output, inject, signal } from '@angular/core';

import { ClosableWidget } from '../../../models/widget';

@Component({
  selector: 'app-clock-widget',
  standalone: false,
  templateUrl: './clock-widget.html',
  styleUrl: './clock-widget.css',
})
export class ClockWidget implements ClosableWidget {
  @Output() closed = new EventEmitter<void>();

  readonly time = signal(new Date().toLocaleTimeString());

  constructor() {
    const intervalId = setInterval(() => this.time.set(new Date().toLocaleTimeString()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(intervalId));
  }
}
