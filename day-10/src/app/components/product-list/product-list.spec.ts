import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ProductList } from './product-list';

const sampleProducts: Product[] = [
  { id: 1, name: 'Keyboard', price: 49.99 },
  { id: 2, name: 'Mouse', price: 19.99 },
];

function setup(productServiceSpy: jasmine.SpyObj<ProductService>) {
  TestBed.configureTestingModule({
    declarations: [ProductList],
    providers: [{ provide: ProductService, useValue: productServiceSpy }],
  });

  const fixture = TestBed.createComponent(ProductList);
  fixture.detectChanges(); // triggers ngOnInit -> load()

  return { fixture, component: fixture.componentInstance };
}

function itemRows(fixture: ComponentFixture<ProductList>): NodeListOf<HTMLLIElement> {
  return fixture.nativeElement.querySelectorAll('li');
}

describe('ProductList', () => {
  let productService: jasmine.SpyObj<ProductService>;

  beforeEach(() => {
    // createSpyObj stands in for the real ProductService entirely — no HttpClient,
    // no HttpTestingController, just two methods whose return values we control.
    productService = jasmine.createSpyObj<ProductService>('ProductService', [
      'getProducts',
      'deleteProduct',
    ]);
  });

  it('shows a loading state before the products arrive', () => {
    // A Subject that never emits keeps the component stuck in "loading" —
    // unlike of(...), it doesn't resolve synchronously.
    productService.getProducts.and.returnValue(new Subject());

    const { fixture } = setup(productService);

    expect(fixture.nativeElement.textContent).toContain('Loading');
  });

  it('renders each product returned by the service on init', () => {
    productService.getProducts.and.returnValue(of(sampleProducts));

    const { fixture } = setup(productService);

    expect(productService.getProducts).toHaveBeenCalledTimes(1);
    const rows = itemRows(fixture);
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Keyboard');
    expect(rows[0].textContent).toContain('$49.99');
  });

  it('shows an error message when loading fails', () => {
    productService.getProducts.and.returnValue(throwError(() => new Error('network down')));

    const { fixture } = setup(productService);

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain(
      'Could not load products.',
    );
  });

  it('shows an empty-state message when the service returns no products', () => {
    productService.getProducts.and.returnValue(of([]));

    const { fixture } = setup(productService);

    expect(fixture.nativeElement.querySelector('.empty')).toBeTruthy();
  });

  it('re-fetches the products when Refresh is clicked', () => {
    productService.getProducts.and.returnValue(of(sampleProducts));
    const { fixture } = setup(productService);

    fixture.nativeElement.querySelector('button').click();

    expect(productService.getProducts).toHaveBeenCalledTimes(2);
  });

  it('removes a product from the list once the service confirms the delete', () => {
    productService.getProducts.and.returnValue(of(sampleProducts));
    productService.deleteProduct.and.returnValue(of(undefined));
    const { fixture } = setup(productService);

    itemRows(fixture)[0].querySelector<HTMLButtonElement>('.remove-btn')!.click();
    fixture.detectChanges();

    expect(productService.deleteProduct).toHaveBeenCalledWith(1);
    expect(itemRows(fixture).length).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('Keyboard');
  });

  it('leaves the list untouched and shows an error if the delete fails', () => {
    productService.getProducts.and.returnValue(of(sampleProducts));
    productService.deleteProduct.and.returnValue(throwError(() => new Error('forbidden')));
    const { fixture } = setup(productService);

    itemRows(fixture)[0].querySelector<HTMLButtonElement>('.remove-btn')!.click();
    fixture.detectChanges();

    expect(itemRows(fixture).length).toBe(2);
    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain(
      'Could not delete that product.',
    );
  });
});
