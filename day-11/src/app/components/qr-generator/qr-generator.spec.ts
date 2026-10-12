import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatePipe, provideTranslateService } from '@ngx-translate/core';

import { QrCodeService } from '../../services/qr-code.service';
import { QrGenerator } from './qr-generator';

function setup(qrCodeServiceSpy: Partial<QrCodeService>) {
  TestBed.configureTestingModule({
    declarations: [QrGenerator],
    imports: [TranslatePipe],
    providers: [
      provideTranslateService({ lang: 'en' }), // no-op loader; these tests don't need real translations
      { provide: QrCodeService, useValue: qrCodeServiceSpy },
    ],
  });

  const fixture = TestBed.createComponent(QrGenerator);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

function textInput(fixture: ComponentFixture<QrGenerator>): HTMLInputElement {
  return fixture.nativeElement.querySelector('#qr-text');
}

function submitButton(fixture: ComponentFixture<QrGenerator>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button[type="submit"]');
}

function typeText(fixture: ComponentFixture<QrGenerator>, value: string): void {
  const el = textInput(fixture);
  el.value = value;
  el.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

// This app is zoneless, so nothing auto-flushes the microtask queue between
// a click and its mocked service's Promise resolving — a plain setTimeout
// flush is more dependable here than relying on fixture.whenStable() to
// know about a promise it never tracked in the first place.
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('QrGenerator', () => {
  it('disables Generate until text is entered', () => {
    const { fixture } = setup({});

    expect(submitButton(fixture).disabled).toBe(true);

    typeText(fixture, 'https://example.com');

    expect(submitButton(fixture).disabled).toBe(false);
  });

  it('calls QrCodeService.render with the trimmed text and no logo by default', async () => {
    const render = vi.fn().mockResolvedValue(undefined);
    const { fixture } = setup({ render, toDataUrl: vi.fn().mockReturnValue('data:image/png;base64,x') });

    typeText(fixture, '  https://example.com  ');
    submitButton(fixture).click();
    await flushPromises();

    expect(render).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      'https://example.com',
      expect.objectContaining({ logo: undefined }),
    );
  });

  it('shows a download link once rendering succeeds', async () => {
    const render = vi.fn().mockResolvedValue(undefined);
    const toDataUrl = vi.fn().mockReturnValue('data:image/png;base64,fake');
    const { fixture } = setup({ render, toDataUrl });

    typeText(fixture, 'https://example.com');
    submitButton(fixture).click();
    await flushPromises();
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.download-link');
    expect(link.getAttribute('href')).toBe('data:image/png;base64,fake');
    expect(link.getAttribute('download')).toBe('qr-code.png');
  });

  it('requests a .jpg filename when JPEG is selected', async () => {
    const render = vi.fn().mockResolvedValue(undefined);
    const toDataUrl = vi.fn().mockReturnValue('data:image/jpeg;base64,fake');
    const { fixture } = setup({ render, toDataUrl });

    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#qr-format');
    select.value = 'image/jpeg';
    select.dispatchEvent(new Event('change'));

    typeText(fixture, 'https://example.com');
    submitButton(fixture).click();
    await flushPromises();
    fixture.detectChanges();

    expect(toDataUrl).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 'image/jpeg');
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.download-link');
    expect(link.getAttribute('download')).toBe('qr-code.jpg');
  });

  it('shows an error and no download link when rendering fails', async () => {
    const render = vi.fn().mockRejectedValue(new Error('boom'));
    const { fixture } = setup({ render });

    typeText(fixture, 'https://example.com');
    submitButton(fixture).click();
    await flushPromises();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain(
      'Could not generate a QR code',
    );
    expect(fixture.nativeElement.querySelector('.download-link')).toBeNull();
  });
});
