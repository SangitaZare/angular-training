import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() title = 'Angular Training';
  @Input() totalStudents = 0;
}
