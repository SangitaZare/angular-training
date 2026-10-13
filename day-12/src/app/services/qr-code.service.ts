import { Injectable } from '@angular/core';
import { toCanvas } from 'qrcode';

const QR_WIDTH_PX = 240;

/**
 * Thin Angular wrapper around the plain `qrcode` npm package — see Day 11's
 * README for why a plain, Angular-agnostic QR library rather than
 * `angularx-qrcode` (its peer dependency range doesn't reach Angular 21).
 * `toCanvas` draws directly onto an `HTMLCanvasElement` already in the DOM
 * rather than returning an image, which is why render() is async.
 */
@Injectable({ providedIn: 'root' })
export class QrCodeService {
  async render(canvas: HTMLCanvasElement, text: string): Promise<void> {
    await toCanvas(canvas, text, {
      errorCorrectionLevel: 'M',
      width: QR_WIDTH_PX,
      margin: 2,
    });
  }

  toDataUrl(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }
}
