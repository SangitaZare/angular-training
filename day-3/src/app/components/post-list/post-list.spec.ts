import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { PostList } from './post-list';
import { PostService } from '../../services/post';
import { Post } from '../../models/post.model';

describe('PostList', () => {
  let component: PostList;
  let fixture: ComponentFixture<PostList>;
  let postServiceSpy: { getPosts: ReturnType<typeof vi.fn> };

  const samplePosts: Post[] = [
    { id: 1, userId: 1, title: 'first post', body: 'body one' },
    { id: 2, userId: 1, title: 'second post', body: 'body two' },
  ];

  beforeEach(async () => {
    postServiceSpy = { getPosts: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [PostList],
      providers: [{ provide: PostService, useValue: postServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PostList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    postServiceSpy.getPosts.mockReturnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load posts on init and render them (dependency injection at work)', () => {
    postServiceSpy.getPosts.mockReturnValue(of(samplePosts));

    fixture.detectChanges();

    expect(postServiceSpy.getPosts).toHaveBeenCalled();
    expect(component.posts()).toEqual(samplePosts);
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBeNull();

    const rows = fixture.nativeElement.querySelectorAll('.post-row');
    expect(rows.length).toBe(2);
  });

  it('should show an error message and a retry button when the request fails', () => {
    postServiceSpy.getPosts.mockReturnValue(throwError(() => new Error('Server returned code 500')));

    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Server returned code 500');
    const errorBlock = fixture.nativeElement.querySelector('.error');
    expect(errorBlock?.textContent).toContain('Server returned code 500');
    expect(errorBlock?.querySelector('button')).toBeTruthy();
  });

  it('should retry loading posts when loadPosts is called again', () => {
    postServiceSpy.getPosts.mockReturnValueOnce(throwError(() => new Error('boom')));
    fixture.detectChanges();
    expect(component.errorMessage()).toBe('boom');

    postServiceSpy.getPosts.mockReturnValueOnce(of(samplePosts));
    component.loadPosts();

    expect(component.errorMessage()).toBeNull();
    expect(component.posts()).toEqual(samplePosts);
  });

  it('should update the DOM once a genuinely async response arrives, with no manual re-render', async () => {
    // Unlike of(...), a Subject only emits when we tell it to — this mimics
    // a real HttpClient response landing after the initial render, which is
    // what a zoneless app must pick up via signals rather than a plain field.
    const response$ = new Subject<Post[]>();
    postServiceSpy.getPosts.mockReturnValue(response$.asObservable());

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.status')?.textContent).toContain('Loading posts');

    response$.next(samplePosts);
    response$.complete();

    await fixture.whenStable();

    const rows = fixture.nativeElement.querySelectorAll('.post-row');
    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.status')).toBeNull();
  });
});
