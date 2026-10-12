import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: false,
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  protected readonly translate = inject(TranslateService);

  use(lang: string): void {
    this.translate.use(lang).subscribe();
  }
}
