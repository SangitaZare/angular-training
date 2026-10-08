import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Dashboard } from './dashboard';
import { TOKEN_KEY } from '../../auth/auth.service';
import { createMockJwt } from '../../auth/jwt';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 'admin', 3600));

    TestBed.configureTestingModule({
      declarations: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    fixture = TestBed.createComponent(Dashboard);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('shows the current user and role', () => {
    httpMock.expectOne('/api/profile').flush({ message: 'hello from the server' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('admin');
  });

  it('fetches and displays the profile message from /api/profile', () => {
    httpMock.expectOne('/api/profile').flush({ message: 'hello from the server' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('hello from the server');
  });

  it('shows an error if the profile request fails', () => {
    httpMock.expectOne('/api/profile').flush(null, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain('Could not load');
  });
});
