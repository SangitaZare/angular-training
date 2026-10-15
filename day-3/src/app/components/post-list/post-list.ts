import { Component, OnInit, signal } from '@angular/core';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post';

/**
 * Displays posts fetched from PostService. PostService is injected through
 * the constructor (dependency injection) — this component doesn't know or
 * care how PostService gets its HttpClient, only that Angular's injector
 * will hand it a working instance.
 *
 * State is held in signals rather than plain fields: this app has no
 * zone.js (Angular's zoneless default), so nothing automatically tells
 * Angular to re-render after an async HttpClient response arrives outside
 * a template-bound event. Writing to a signal is what notifies Angular's
 * change-detection scheduler in that case.
 */
@Component({
  selector: 'app-post-list',
  standalone: false,
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  posts = signal<Post[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });
  }

  trackById(index: number, post: Post): number {
    return post.id;
  }
}
