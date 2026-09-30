import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Post } from '../models/post.model';

/**
 * Fetches posts from JSONPlaceholder (https://jsonplaceholder.typicode.com),
 * a free mock REST API. Registered with `providedIn: 'root'`, so Angular's
 * injector creates a single shared instance the first time any component
 * asks for it, and hands out that same instance to every other consumer.
 */
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.status === 0
        ? 'Could not reach the server. Check your network connection.'
        : `Server returned code ${error.status}: ${error.message}`;

    return throwError(() => new Error(message));
  }
}
