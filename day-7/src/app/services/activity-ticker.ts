 import { Injectable, signal } from '@angular/core';

/**
 * Stands in for some unrelated, frequently-changing piece of app state —
 * a live notification count, a websocket heartbeat, a header clock — that
 * has nothing to do with the product dashboard but still lives in the same
 * component tree and triggers Angular change detection whenever it changes.
 *
 * It's a plain signal behind a service (rather than `setInterval` inside a
 * component) so tests can call `bump()` directly instead of dealing with
 * real or fake timers.
 */
@Injectable({ providedIn: 'root' })
export class ActivityTicker {
  private readonly _ticks = signal(0);
  readonly ticks = this._ticks.asReadonly();

  private intervalId: ReturnType<typeof setInterval> | undefined;

  bump(): void {
    this._ticks.update((t) => t + 1);
  }

  start(intervalMs = 1500): void {
    this.stop();
    this.intervalId = setInterval(() => this.bump(), intervalMs);
  }

  stop(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
