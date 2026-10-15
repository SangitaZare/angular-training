import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';

import { AuthService } from '../../auth/auth.service';
import { QrCodeService } from '../../services/qr-code.service';

/**
 * Wraps QrCodeService the same way Day 11's QrGenerator did: the canvas
 * lives in the template (captured with @ViewChild), render() draws onto it
 * rather than returning an image, and the download link's href is read back
 * out as a data URL afterward.
 */
@Component({
  selector: 'app-qr-share',
  standalone: false,
  templateUrl: './qr-share.html',
  styleUrl: './qr-share.css',
})
export class QrShare implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly qrCodeService = inject(QrCodeService);

  @ViewChild('qrCanvas') private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  text = '';
  readonly generating = signal(false);
  readonly error = signal<string | null>(null);
  readonly downloadUrl = signal<string | null>(null);

  get canGenerate(): boolean {
    return this.text.trim().length > 0 && !this.generating();
  }

  ngOnInit(): void {
    const username = this.auth.currentUser()?.username ?? 'guest';
    this.text = `${location.origin}/dashboard?ref=${encodeURIComponent(username)}`;
  }

  onTextInput(event: Event): void {
    this.text = (event.target as HTMLInputElement).value;
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
      .render(this.canvasRef.nativeElement, this.text.trim())
      .then(() => {
        this.downloadUrl.set(this.qrCodeService.toDataUrl(this.canvasRef.nativeElement));
        this.generating.set(false);
      })
      .catch(() => {
        this.error.set('Could not generate a QR code for that input.');
        this.generating.set(false);
      });
  }
}
