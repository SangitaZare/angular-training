import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
