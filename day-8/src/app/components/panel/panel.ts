import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel {
  @Input({ required: true }) title!: string;
}
