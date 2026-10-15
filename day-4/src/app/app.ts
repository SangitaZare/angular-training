import { Component } from '@angular/core';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'Day 4: Angular Routing';

  constructor(protected authService: AuthService) {}
}
