import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProductDashboard } from './product-dashboard';
import { ProductCard } from '../product-card/product-card';
import { ProductCardLegacy } from '../product-card-legacy/product-card-legacy';
import { ActivityTicker } from '../../services/activity-ticker';

describe('ProductDashboard', () => {
  let fixture: ComponentFixture<ProductDashboard>;
  let component: ProductDashboard;
  let ticker: { ticks: ReturnType<typeof signal<number>>; bump: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    ticker = {
      ticks: signal(0),
      bump: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [ProductDashboard, ProductCard, ProductCardLegacy],
      imports: [MatCardModule, MatIconModule, MatButtonModule],
      providers: [{ provide: ActivityTicker, useValue: ticker }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts the ticker on init and stops it on destroy', () => {
    expect(ticker.start).toHaveBeenCalled();
    fixture.destroy();
    expect(ticker.stop).toHaveBeenCalled();
  });

  it('renders one OnPush card and one Default card per product', () => {
    const count = component.products().length;
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(count);
    expect(fixture.nativeElement.querySelectorAll('app-product-card-legacy').length).toBe(count);
  });

  it('toggleFavorite() immutably replaces only the matching product', () => {
    const before = component.products();
    const target = before[0];

    component.toggleFavorite(target.id);
    const after = component.products();

    expect(after).not.toBe(before);
    expect(after[0]).not.toBe(before[0]);
    expect(after[0].favorite).toBe(!target.favorite);
    expect(after[1]).toBe(before[1]);
  });

  it('mutateFirstProductInPlace() mutates without producing a new array or object reference', () => {
    const before = component.products();
    const firstBefore = before[0];

    component.mutateFirstProductInPlace();

    expect(component.products()).toBe(before);
    expect(component.products()[0]).toBe(firstBefore);
    expect(component.products()[0].name).toContain('Mutated in place');
  });

  it('stays flat for BOTH cards when nothing anywhere has changed', () => {
    const legacyCard = fixture.debugElement.query(By.directive(ProductCardLegacy))
      .componentInstance as ProductCardLegacy;
    const onPushCard = fixture.debugElement.query(By.directive(ProductCard))
      .componentInstance as ProductCard;

    expect(legacyCard.checks()).toBe(1);
    expect(onPushCard.checks()).toBe(1);

    fixture.detectChanges();
    fixture.detectChanges();

    expect(legacyCard.checks()).toBe(1);
    expect(onPushCard.checks()).toBe(1);
  });

  // NOTE on what this does NOT test: the classic zone.js-era mental model
  // says an unrelated signal change (like the activity ticker) should
  // refresh the Default card but let the OnPush card skip, since its own
  // `product` input reference never changed. I built exactly that demo
  // first and verified it against this running app with Playwright — and
  // it does not hold here: both cards' `checks()` climb together every
  // time, in dev-mode zoneless Angular 21.2, whenever *anything* in the
  // app changes (confirmed with a minimal TestBed repro with no Material
  // involved at all, and again live in Chrome). See the README's OnPush
  // section for the investigation and what's still reliably true.
  it('both cards ARE checked together when an unrelated signal elsewhere changes (verified current behavior)', () => {
    const legacyCard = fixture.debugElement.query(By.directive(ProductCardLegacy))
      .componentInstance as ProductCardLegacy;
    const onPushCard = fixture.debugElement.query(By.directive(ProductCard))
      .componentInstance as ProductCard;

    ticker.ticks.set(1);
    fixture.detectChanges();

    expect(legacyCard.checks()).toBe(2);
    expect(onPushCard.checks()).toBe(2);
  });

  it('renameFirstProductImmutably() produces a new array and a new first-product object', () => {
    const before = component.products();
    const firstBefore = before[0];

    component.renameFirstProductImmutably();
    const after = component.products();

    expect(after).not.toBe(before);
    expect(after[0]).not.toBe(firstBefore);
    expect(after[0].name).toContain('Renamed immutably');
    expect(after[1]).toBe(before[1]);
  });
});
