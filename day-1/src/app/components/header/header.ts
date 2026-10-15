import { Component, Input } from '@angular/core';

/**
 * Presentational component: receives all of its data through @Input
 * bindings from the parent (one-way, parent -> child property binding).
 */
@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() title = 'Angular Training';
  @Input() studentCount = 0;
}
