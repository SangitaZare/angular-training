import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProductCardLegacy } from './product-card-legacy';
import { Product } from '../../models/product';

const PRODUCT_A: Product = { id: 1, name: 'Keyboard', price: 79, stock: 14, favorite: false };

describe('ProductCardLegacy (Default strategy)', () => {
  let fixture: ComponentFixture<ProductCardLegacy>;
  let component: ProductCardLegacy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductCardLegacy],
      imports: [MatCardModule, MatIconModule, MatButtonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardLegacy);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', PRODUCT_A);
    fixture.detectChanges();
  });

  it('renders the product', () => {
    expect(fixture.nativeElement.textContent).toContain('Keyboard');
  });

  it('counts the initial check via ngDoCheck, and stays flat when nothing changes', () => {
    // Zoneless Angular schedules a check only when something is actually
    // dirty. With no signal/input change, a repeated detectChanges() is a
    // genuine no-op here — true for both strategies (see ProductCard's own
    // spec for the same assertion on the OnPush card).
    expect(component.checks()).toBe(1);

    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.checks()).toBe(1);
  });

  it('is re-checked once a new @Input() reference is passed in', () => {
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
});
