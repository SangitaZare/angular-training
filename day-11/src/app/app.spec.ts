import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslatePipe, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { App } from './app';
import { LanguageSwitcher } from './components/language-switcher/language-switcher';
import { QrGenerator } from './components/qr-generator/qr-generator';

function setup() {
  TestBed.configureTestingModule({
    declarations: [App, LanguageSwitcher, QrGenerator],
    imports: [TranslatePipe],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideTranslateService({
        lang: 'en',
        fallbackLang: 'en',
        loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      }),
    ],
  });

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges(); // constructs TranslateService, which fires use('en') -> a GET for /i18n/en.json

  const httpMock = TestBed.inject(HttpTestingController);
  // currentLang and fallbackLang are both 'en' here, so this can be one or
  // two in-flight requests depending on whether the service dedupes them —
  // .match() (unlike expectOne) doesn't care which, it just flushes all of them.
  httpMock
    .match('/i18n/en.json')
    .forEach((req) => req.flush({ APP: { TITLE: 'Day 11: QR Code Generation and Language Translation' } }));
  fixture.detectChanges();

  return { fixture, httpMock };
}

describe('App', () => {
  it('renders the translated title once the language file loads', () => {
    const { fixture } = setup();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
      'Day 11: QR Code Generation and Language Translation',
    );
  });

  it('mounts the language switcher and the QR generator', () => {
    const { fixture } = setup();

    expect(fixture.nativeElement.querySelector('app-language-switcher')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-qr-generator')).toBeTruthy();
  });
});
