import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { LanguageSwitcher } from './language-switcher';

function setup() {
  TestBed.configureTestingModule({
    declarations: [LanguageSwitcher],
    // No `loader` given -> defaults to the built-in no-op loader, so this
    // never makes an HTTP request; these tests only care about `use()` and
    // `currentLang()`, not what the translation files actually contain.
    providers: [provideTranslateService({ lang: 'en' })],
  });

  const fixture = TestBed.createComponent(LanguageSwitcher);
  fixture.detectChanges();

  return { fixture };
}

function buttons(fixture: ReturnType<typeof setup>['fixture']): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

describe('LanguageSwitcher', () => {
  it('marks English active by default', () => {
    const { fixture } = setup();

    const [english, spanish] = buttons(fixture);
    expect(english.textContent?.trim()).toBe('English');
    expect(english.classList.contains('active')).toBe(true);
    expect(spanish.classList.contains('active')).toBe(false);
  });

  it('switches the active language when Español is clicked', () => {
    const { fixture } = setup();

    const [, spanish] = buttons(fixture);
    spanish.click();
    fixture.detectChanges();

    expect(spanish.classList.contains('active')).toBe(true);
    expect(buttons(fixture)[0].classList.contains('active')).toBe(false);
  });
});
