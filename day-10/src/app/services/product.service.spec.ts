import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Product } from '../models/product';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Fails the test if any request was expected but never made (or vice versa).
    httpMock.verify();
  });

  it('fetches the product list with a GET to /api/products', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Keyboard', price: 49.99 },
      { id: 2, name: 'Mouse', price: 19.99 },
    ];
    let result: Product[] | undefined;

    service.getProducts().subscribe((products) => (result = products));

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);

    expect(result).toEqual(mockProducts);
  });

  it('propagates a server error instead of swallowing it', () => {
    let failure: unknown;

    service.getProducts().subscribe({
      next: () => fail('expected the request to error'),
      error: (err) => (failure = err),
    });

    httpMock
      .expectOne('/api/products')
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(failure).toBeTruthy();
  });

  it('adds a product with a POST carrying the product body', () => {
    const newProduct = { name: 'Monitor', price: 199.99 };
    const created: Product = { id: 3, ...newProduct };
    let result: Product | undefined;

    service.addProduct(newProduct).subscribe((product) => (result = product));

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush(created);

    expect(result).toEqual(created);
  });

  it('deletes a product with a DELETE to its id-specific URL', () => {
    let completed = false;

    service.deleteProduct(1).subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne('/api/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });
});
