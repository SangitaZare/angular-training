import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { mockBackendInterceptor } from './mock-backend.interceptor';
import { createMockJwt } from './jwt';

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

  describe('GET /api/profile', () => {
    it('rejects with 401 when no Authorization header is present', async () => {
      await expect(firstValueFrom(http.get('/api/profile'))).rejects.toMatchObject({ status: 401 });
    });

    it('returns data when a valid token is attached', async () => {
      const token = createMockJwt('user', 'user', 3600);

      const response = await firstValueFrom(
        http.get('/api/profile', { headers: { Authorization: `Bearer ${token}` } }),
      );

      expect(response).toBeTruthy();
    });

    it('rejects with 401 for an expired token', async () => {
      const token = createMockJwt('user', 'user', -10);

      await expect(
        firstValueFrom(http.get('/api/profile', { headers: { Authorization: `Bearer ${token}` } })),
      ).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('GET /api/admin/stats', () => {
    it('returns data for an admin token', async () => {
      const token = createMockJwt('admin', 'admin', 3600);

      const response = await firstValueFrom(
        http.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
      );

      expect(response).toBeTruthy();
    });

    it('rejects with 403 for a valid, but non-admin, token', async () => {
      const token = createMockJwt('user', 'user', 3600);

      await expect(
        firstValueFrom(http.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })),
      ).rejects.toMatchObject({ status: 403 });
    });
  });
});
