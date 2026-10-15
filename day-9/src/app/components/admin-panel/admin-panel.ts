import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';

interface AdminStats {
  totalUsers: number;
  uptimeHours: number;
}

@Component({
  selector: 'app-admin-panel',
  standalone: false,
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  private readonly http = inject(HttpClient);

  readonly stats = signal<AdminStats | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get<AdminStats>('/api/admin/stats').subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load admin stats.');
        this.loading.set(false);
      },
    });
  }
}
