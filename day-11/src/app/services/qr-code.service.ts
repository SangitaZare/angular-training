import { Injectable } from '@angular/core';
import { toCanvas } from 'qrcode';

export type QrImageFormat = 'image/png' | 'image/jpeg';

export interface QrRenderOptions {
  /** Drawn centered over the finished code, with a white backing square. */
  logo?: HTMLImageElement;
  /** Fraction of the code's width the logo occupies. @default 0.22 */
  logoSizeRatio?: number;
}

const QR_WIDTH_PX = 320;

@Injectable({ providedIn: 'root' })
export class QrCodeService {
  async render(canvas: HTMLCanvasElement, text: string, options: QrRenderOptions = {}): Promise<void> {
    await toCanvas(canvas, text, {
      // 'H' (~30% of modules can be wrong and still scan) is what makes
      // stamping a logo over the middle of the code safe at all — any lower
      // level and a centered logo would make the code unreadable.
      errorCorrectionLevel: 'H',
      width: QR_WIDTH_PX,
      margin: 2,
    });

    if (options.logo) {
      this.drawLogo(canvas, options.logo, options.logoSizeRatio ?? 0.22);
    }
  }

  toDataUrl(canvas: HTMLCanvasElement, format: QrImageFormat): string {
    return format === 'image/jpeg' ? canvas.toDataURL(format, 0.92) : canvas.toDataURL(format);
  }

  private drawLogo(canvas: HTMLCanvasElement, logo: HTMLImageElement, sizeRatio: number): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const size = canvas.width * sizeRatio;
    const x = (canvas.width - size) / 2;
    const y = (canvas.height - size) / 2;
    const padding = size * 0.12;

    // The backing square keeps the modules the logo covers from reading as
    // noise around its edges — without it, anything but an opaque square
    // logo blends into the code instead of standing clear of it.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - padding, y - padding, size + padding * 2, size + padding * 2);
    ctx.drawImage(logo, x, y, size, size);
  }
}
