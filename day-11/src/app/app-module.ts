import { provideHttpClient } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslatePipe, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { App } from './app';
import { LanguageSwitcher } from './components/language-switcher/language-switcher';
import { QrGenerator } from './components/qr-generator/qr-generator';

@NgModule({
  declarations: [App, LanguageSwitcher, QrGenerator],
  imports: [BrowserModule, TranslatePipe],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideTranslateService({
      lang: 'en',
      fallbackLang: 'en',
      // public/i18n/*.json is served at /i18n/*.json — the CLI's default
      // prefix (/assets/i18n/) is the older `src/assets` convention this
      // project doesn't use.
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    }),
  ],
  bootstrap: [App],
})
export class AppModule {}
