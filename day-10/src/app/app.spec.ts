import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { ProductForm } from './components/product-form/product-form';
import { ProductList } from './components/product-list/product-list';

function setup() {
  TestBed.configureTestingModule({
    declarations: [App, ProductList, ProductForm],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges(); // mounts ProductList, which fires its own GET on ngOnInit

  return { fixture, httpMock: TestBed.inject(HttpTestingController) };
}

describe('App', () => {
  it('creates the app and its child components', () => {
    const { fixture, httpMock } = setup();
    httpMock.expectOne('/api/products').flush([]);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the products the ProductList child loads on startup', () => {
    const { fixture, httpMock } = setup();
    httpMock.expectOne('/api/products').flush([{ id: 1, name: 'Keyboard', price: 49.99 }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Keyboard');
  });
});
