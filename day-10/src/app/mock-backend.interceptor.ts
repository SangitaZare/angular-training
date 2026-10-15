import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

import { Product } from './models/product';

const SIMULATED_LATENCY_MS = 300;

let products: Product[] = [
  { id: 1, name: 'Keyboard', price: 49.99 },
  { id: 2, name: 'Mouse', price: 19.99 },
  { id: 3, name: 'Monitor', price: 199.99 },
];
let nextId = 4;

/**
 * Stands in for a real backend so ProductService has something to talk to
 * when you `ng serve` this app. No spec file loads this interceptor — the
 * unit tests either mock ProductService directly or use
 * HttpTestingController instead — so it only matters for manual browsing.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url === '/api/products') {
    return of(new HttpResponse({ status: 200, body: products })).pipe(delay(SIMULATED_LATENCY_MS));
  }

  if (req.method === 'POST' && req.url === '/api/products') {
    const body = req.body as Omit<Product, 'id'>;
    const created: Product = { id: nextId++, ...body };
    products = [...products, created];
    return of(new HttpResponse({ status: 201, body: created })).pipe(delay(SIMULATED_LATENCY_MS));
  }

  const match = /^\/api\/products\/(\d+)$/.exec(req.url);
  if (req.method === 'DELETE' && match) {
    const id = Number(match[1]);
    if (!products.some((product) => product.id === id)) {
      return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' })).pipe(
        delay(SIMULATED_LATENCY_MS),
      );
    }
    products = products.filter((product) => product.id !== id);
    return of(new HttpResponse({ status: 200, body: null })).pipe(delay(SIMULATED_LATENCY_MS));
  }

  return next(req);
};
