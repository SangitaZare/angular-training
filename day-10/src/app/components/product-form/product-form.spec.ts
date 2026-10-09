import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ProductForm } from './product-form';

function setup() {
  // ProductService is real here (not mocked) so it needs a real HttpClient to
  // inject, even though spyOn below replaces the one method that would
  // otherwise use it — the service still has to construct successfully.
  TestBed.configureTestingModule({
    declarations: [ProductForm],
    providers: [provideHttpClient()],
  });

  const fixture = TestBed.createComponent(ProductForm);
  const productService = TestBed.inject(ProductService);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, productService };
}

function nameInput(fixture: ComponentFixture<ProductForm>): HTMLInputElement {
  return fixture.nativeElement.querySelector('#name');
}

function priceInput(fixture: ComponentFixture<ProductForm>): HTMLInputElement {
  return fixture.nativeElement.querySelector('#price');
}

function submitButton(fixture: ComponentFixture<ProductForm>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button[type="submit"]');
}

function typeProduct(fixture: ComponentFixture<ProductForm>, name: string, price: string): void {
  const nameEl = nameInput(fixture);
  nameEl.value = name;
  nameEl.dispatchEvent(new Event('input'));

  const priceEl = priceInput(fixture);
  priceEl.value = price;
  priceEl.dispatchEvent(new Event('input'));

  fixture.detectChanges();
}

describe('ProductForm', () => {
  it('disables submit until both a name and a positive price are entered', () => {
    const { fixture } = setup();

    expect(submitButton(fixture).disabled).toBe(true);

    typeProduct(fixture, 'Monitor', '199.99');

    expect(submitButton(fixture).disabled).toBe(false);
  });

  it('keeps submit disabled for a zero or negative price', () => {
    const { fixture } = setup();

    typeProduct(fixture, 'Monitor', '0');

    expect(submitButton(fixture).disabled).toBe(true);
  });

  it('calls ProductService.addProduct with the trimmed form values on submit', () => {
    const { fixture, productService } = setup();
    // spyOn a single method on the real (DI-provided) service, rather than
    // replacing the whole service the way the ProductList spec does — both
    // are legitimate ways to mock a dependency; this one is handy when you
    // only need to control one call and leave everything else real.
    const addSpy = spyOn(productService, 'addProduct').and.returnValue(
      of<Product>({ id: 9, name: 'Monitor', price: 199.99 }),
    );

    typeProduct(fixture, '  Monitor  ', '199.99');
    submitButton(fixture).click();

    expect(addSpy).toHaveBeenCalledWith({ name: 'Monitor', price: 199.99 });
  });

  it('emits "added" with the created product and resets the form on success', () => {
    const { fixture, component, productService } = setup();
    spyOn(productService, 'addProduct').and.returnValue(
      of<Product>({ id: 9, name: 'Monitor', price: 199.99 }),
    );
    const addedSpy = jasmine.createSpy('added');
    component.added.subscribe(addedSpy);

    typeProduct(fixture, 'Monitor', '199.99');
    submitButton(fixture).click();
    fixture.detectChanges();

    expect(addedSpy).toHaveBeenCalledWith({ id: 9, name: 'Monitor', price: 199.99 });
    expect(nameInput(fixture).value).toBe('');
  });

  it('shows an error and keeps the typed values when the request fails', () => {
    const { fixture, productService } = setup();
    spyOn(productService, 'addProduct').and.returnValue(throwError(() => new Error('boom')));

    typeProduct(fixture, 'Monitor', '199.99');
    submitButton(fixture).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain(
      'Could not add that product.',
    );
    expect(nameInput(fixture).value).toBe('Monitor');
  });
});
