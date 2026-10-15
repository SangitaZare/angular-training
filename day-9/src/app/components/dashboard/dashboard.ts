import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';

import { AuthService } from '../../auth/auth.service';

interface ProfileResponse {
  message: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly profileMessage = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get<ProfileResponse>('/api/profile').subscribe({
      next: (response) => {
        this.profileMessage.set(response.message);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your profile.');
        this.loading.set(false);
      },
    });
  }
}
