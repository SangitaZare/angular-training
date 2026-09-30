import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PostService } from './post';
import { Post } from '../models/post.model';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch posts via GET', () => {
    const mockPosts: Post[] = [
      { id: 1, userId: 1, title: 'First post', body: 'Body 1' },
      { id: 2, userId: 1, title: 'Second post', body: 'Body 2' },
    ];

    let result: Post[] | undefined;
    service.getPosts().subscribe((posts) => (result = posts));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);

    expect(result).toEqual(mockPosts);
  });

  it('should surface a friendly message on a server error', () => {
    let error: Error | undefined;
    let nextCalled = false;
    service.getPosts().subscribe({
      next: () => (nextCalled = true),
      error: (err) => (error = err),
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush('Internal error', { status: 500, statusText: 'Server Error' });

    expect(nextCalled).toBe(false);
    expect(error?.message).toContain('500');
  });

  it('should surface a friendly message on a network error', () => {
    let error: Error | undefined;
    let nextCalled = false;
    service.getPosts().subscribe({
      next: () => (nextCalled = true),
      error: (err) => (error = err),
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent('network error'), { status: 0 });

    expect(nextCalled).toBe(false);
    expect(error?.message).toContain('Could not reach the server');
  });
});
