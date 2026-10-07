import { EventEmitter } from '@angular/core';

/**
 * The one thing DynamicLoader needs from any component it creates at
 * runtime: a way to ask to be removed. Dynamically created components have
 * no template to write `(closed)="..."` in, so DynamicLoader subscribes to
 * this directly on the ComponentRef instance instead.
 */
export interface ClosableWidget {
  closed: EventEmitter<void>;
}
