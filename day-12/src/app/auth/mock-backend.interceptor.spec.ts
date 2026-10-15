import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { mockBackendInterceptor } from './mock-backend.interceptor';
import { createMockJwt } from './jwt';
import { Project } from '../store/projects/project.model';

describe('mockBackendInterceptor', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockBackendInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  describe('POST /api/auth/login', () => {
    it('returns a JWT-shaped token for valid credentials', async () => {
      const response = await firstValueFrom(
        http.post<{ token: string }>('/api/auth/login', { username: 'admin', password: 'admin123' }),
      );

      expect(response.token.split('.')).toHaveLength(3);
    });

    it('rejects with 401 for a wrong password', async () => {
      await expect(
        firstValueFrom(http.post('/api/auth/login', { username: 'admin', password: 'wrong' })),
      ).rejects.toMatchObject({ status: 401 });
    });

    it('rejects with 401 for an unknown username', async () => {
      await expect(
        firstValueFrom(http.post('/api/auth/login', { username: 'ghost', password: 'x' })),
      ).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('GET /api/projects', () => {
    it('rejects with 401 when no Authorization header is present', async () => {
      await expect(firstValueFrom(http.get('/api/projects'))).rejects.toMatchObject({ status: 401 });
    });

    it('rejects with 401 for an expired token', async () => {
      const token = createMockJwt('user', -10);

      await expect(
        firstValueFrom(http.get('/api/projects', { headers: { Authorization: `Bearer ${token}` } })),
      ).rejects.toMatchObject({ status: 401 });
    });

    it('returns the seeded project list for a valid token', async () => {
      const token = createMockJwt('user', 3600);

      const response = await firstValueFrom(
        http.get<Project[]>('/api/projects', { headers: { Authorization: `Bearer ${token}` } }),
      );

      expect(response.length).toBeGreaterThan(0);
      expect(response[0]).toMatchObject({ id: expect.any(String), name: expect.any(String) });
    });
  });
});
