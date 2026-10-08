import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminPanel } from './admin-panel';

describe('AdminPanel', () => {
  let fixture: ComponentFixture<AdminPanel>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminPanel],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    fixture = TestBed.createComponent(AdminPanel);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches and displays stats from /api/admin/stats', () => {
    httpMock.expectOne('/api/admin/stats').flush({ totalUsers: 2, uptimeHours: 42 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('2');
    expect(fixture.nativeElement.textContent).toContain('42 hours');
  });

  it('shows an error if the stats request fails', () => {
    httpMock.expectOne('/api/admin/stats').flush(null, { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain('Could not load');
  });
});
