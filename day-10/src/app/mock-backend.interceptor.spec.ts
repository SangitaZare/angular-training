import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Product } from './models/product';
import { mockBackendInterceptor } from './mock-backend.interceptor';

describe('mockBackendInterceptor', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockBackendInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  describe('GET /api/products', () => {
    it('returns the seeded product list', async () => {
      const products = await firstValueFrom(http.get<Product[]>('/api/products'));

      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toEqual(jasmine.objectContaining({ name: jasmine.any(String) }));
    });
  });

  describe('POST /api/products', () => {
    it('assigns an id and adds the product so a later GET includes it', async () => {
      const created = await firstValueFrom(
        http.post<Product>('/api/products', { name: 'Webcam', price: 59.99 }),
      );
      expect(created.id).toBeTruthy();
      expect(created.name).toBe('Webcam');

      const products = await firstValueFrom(http.get<Product[]>('/api/products'));
      expect(products).toContain(jasmine.objectContaining({ name: 'Webcam' }));
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('removes the product so a later GET no longer includes it', async () => {
      const created = await firstValueFrom(
        http.post<Product>('/api/products', { name: 'Headset', price: 29.99 }),
      );

      await firstValueFrom(http.delete(`/api/products/${created.id}`));

      const products = await firstValueFrom(http.get<Product[]>('/api/products'));
      expect(products).not.toContain(jasmine.objectContaining({ name: 'Headset' }));
    });

    it('rejects with 404 for an id that does not exist', async () => {
      try {
        await firstValueFrom(http.delete('/api/products/999999'));
        fail('expected the request to error');
      } catch (err) {
        expect((err as HttpErrorResponse).status).toBe(404);
      }
    });
  });
});
