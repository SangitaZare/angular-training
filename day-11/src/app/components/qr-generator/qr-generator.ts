import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';

import { QrCodeService, QrImageFormat } from '../../services/qr-code.service';

@Component({
  selector: 'app-qr-generator',
  standalone: false,
  templateUrl: './qr-generator.html',
  styleUrl: './qr-generator.css',
})
export class QrGenerator {
  private readonly qrCodeService = inject(QrCodeService);

  @ViewChild('qrCanvas') private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  text = '';
  format: QrImageFormat = 'image/png';
  logoImage: HTMLImageElement | null = null;

  readonly generating = signal(false);
  readonly error = signal<string | null>(null);
  readonly downloadUrl = signal<string | null>(null);

  get canGenerate(): boolean {
    return this.text.trim().length > 0 && !this.generating();
  }

  get formatLabel(): string {
    return this.format === 'image/jpeg' ? 'JPEG' : 'PNG';
  }

  get downloadFilename(): string {
    return this.format === 'image/jpeg' ? 'qr-code.jpg' : 'qr-code.png';
  }

  onTextInput(event: Event): void {
    this.text = (event.target as HTMLInputElement).value;
  }

  onFormatChange(event: Event): void {
    this.format = (event.target as HTMLSelectElement).value as QrImageFormat;
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      this.logoImage = null;
      return;
    }

    const image = new Image();
    image.onload = () => (this.logoImage = image);
    image.onerror = () => this.error.set('Could not read that image file.');
    image.src = URL.createObjectURL(file);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canGenerate) {
      return;
    }

    this.generating.set(true);
    this.error.set(null);
    this.downloadUrl.set(null);

    this.qrCodeService
      .render(this.canvasRef.nativeElement, this.text.trim(), { logo: this.logoImage ?? undefined })
      .then(() => {
        this.downloadUrl.set(this.qrCodeService.toDataUrl(this.canvasRef.nativeElement, this.format));
        this.generating.set(false);
      })
      .catch(() => {
        this.error.set('Could not generate a QR code for that input.');
        this.generating.set(false);
      });
  }
}
