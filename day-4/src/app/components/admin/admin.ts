import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  constructor(protected authService: AuthService) {}
}
