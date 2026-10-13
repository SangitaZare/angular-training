import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { QrShare } from './qr-share';
import { QrCodeService } from '../../services/qr-code.service';
import { TOKEN_KEY } from '../../auth/auth.service';
import { createMockJwt } from '../../auth/jwt';

function setup(qrCodeServiceSpy: Partial<QrCodeService>) {
  TestBed.configureTestingModule({
    declarations: [QrShare],
    imports: [NoopAnimationsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: QrCodeService, useValue: qrCodeServiceSpy },
    ],
  });

  const fixture = TestBed.createComponent(QrShare);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

function textInput(fixture: ComponentFixture<QrShare>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input');
}

function submitButton(fixture: ComponentFixture<QrShare>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button[type="submit"]');
}

function typeText(fixture: ComponentFixture<QrShare>, value: string): void {
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

describe('QrShare', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('pre-fills the text field with a dashboard link for the signed-in user', () => {
    sessionStorage.setItem(TOKEN_KEY, createMockJwt('admin', 3600));

    const { fixture } = setup({});

    expect(textInput(fixture).value).toContain('/dashboard?ref=admin');
  });

  it('falls back to "guest" when nobody is signed in', () => {
    const { fixture } = setup({});

    expect(textInput(fixture).value).toContain('ref=guest');
  });

  it('disables Generate when the text field is cleared', () => {
    const { fixture } = setup({});

    expect(submitButton(fixture).disabled).toBe(false);

    typeText(fixture, '   ');

    expect(submitButton(fixture).disabled).toBe(true);
  });

  it('calls QrCodeService.render with the trimmed text', async () => {
    const render = vi.fn().mockResolvedValue(undefined);
    const { fixture } = setup({ render, toDataUrl: vi.fn().mockReturnValue('data:image/png;base64,x') });

    typeText(fixture, '  https://example.com  ');
    submitButton(fixture).click();
    await flushPromises();

    expect(render).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 'https://example.com');
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
    expect(link.getAttribute('download')).toBe('dashboard-qr.png');
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
