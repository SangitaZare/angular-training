import { Component, EventEmitter, Output, signal } from '@angular/core';

import { ClosableWidget } from '../../../models/widget';

const QUOTES: readonly string[] = [
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'Simplicity is the soul of efficiency. — Austin Freeman',
  'First, solve the problem. Then, write the code. — John Johnson',
  'Programs must be written for people to read. — Harold Abelson',
];

@Component({
  selector: 'app-quote-widget',
  standalone: false,
  templateUrl: './quote-widget.html',
  styleUrl: './quote-widget.css',
})
export class QuoteWidget implements ClosableWidget {
  @Output() closed = new EventEmitter<void>();

  readonly quote = signal(QUOTES[0]);

  private index = 0;

  next(): void {
    this.index = (this.index + 1) % QUOTES.length;
    this.quote.set(QUOTES[this.index]);
  }
}
