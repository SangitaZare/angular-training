import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProductCard } from './product-card';
import { Product } from '../../models/product';

const PRODUCT_A: Product = { id: 1, name: 'Keyboard', price: 79, stock: 14, favorite: false };

describe('ProductCard (OnPush)', () => {
  let fixture: ComponentFixture<ProductCard>;
  let component: ProductCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductCard],
      imports: [MatCardModule, MatIconModule, MatButtonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', PRODUCT_A);
    fixture.detectChanges();
  });

  it('renders the product', () => {
    expect(fixture.nativeElement.textContent).toContain('Keyboard');
    expect(fixture.nativeElement.textContent).toContain('14 in stock');
  });

  it('stays flat when nothing changes, across repeated detectChanges() calls', () => {
    expect(component.checks()).toBe(1);

    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.checks()).toBe(1);
  });

  it('is re-checked once a new @Input() reference is passed in', () => {
    expect(component.checks()).toBe(1);

    fixture.componentRef.setInput('product', { ...PRODUCT_A, name: 'Renamed' });
    fixture.detectChanges();

    expect(component.checks()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Renamed');
  });

  it('emits favorite when its star button is clicked', () => {
    let emitted = false;
    component.favorite.subscribe(() => (emitted = true));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emitted).toBe(true);
  });

  it('shows the aria-pressed state matching product.favorite', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');

    fixture.componentRef.setInput('product', { ...PRODUCT_A, favorite: true });
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});
