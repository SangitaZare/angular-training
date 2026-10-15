import { TestBed } from '@angular/core/testing';
import { toCanvas } from 'qrcode';

import { QrCodeService } from './qr-code.service';

// jsdom's <canvas> has no real rendering backend (getContext('2d') returns
// null without the native `canvas` package), so these tests never touch a
// real HTMLCanvasElement — they pass a plain object shaped like one and
// assert on the calls this service makes, not on actual pixels.
vi.mock('qrcode', () => ({ toCanvas: vi.fn().mockResolvedValue(undefined) }));

function fakeCanvas(ctx: Partial<CanvasRenderingContext2D> | null = null) {
  return {
    width: 320,
    height: 320,
    getContext: vi.fn().mockReturnValue(ctx),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,fake'),
  } as unknown as HTMLCanvasElement;
}

describe('QrCodeService', () => {
  let service: QrCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrCodeService);
    vi.mocked(toCanvas).mockClear();
  });

  it('renders with high error correction so a logo can safely cover the center', async () => {
    const canvas = fakeCanvas();

    await service.render(canvas, 'https://example.com');

    expect(toCanvas).toHaveBeenCalledWith(
      canvas,
      'https://example.com',
      expect.objectContaining({ errorCorrectionLevel: 'H' }),
    );
  });

  it('does not touch the canvas context when no logo is given', async () => {
    const canvas = fakeCanvas();

    await service.render(canvas, 'hello');

    expect(canvas.getContext).not.toHaveBeenCalled();
  });

  it('draws a white backing square and the logo centered when one is given', async () => {
    const ctx = { fillRect: vi.fn(), drawImage: vi.fn(), fillStyle: '' };
    const canvas = fakeCanvas(ctx as unknown as CanvasRenderingContext2D);
    const logo = {} as HTMLImageElement;

    await service.render(canvas, 'hello', { logo, logoSizeRatio: 0.2 });

    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalledWith(logo, expect.any(Number), expect.any(Number), 64, 64);
  });

  it('silently skips the logo if the canvas context is unavailable', async () => {
    const canvas = fakeCanvas(null);
    const logo = {} as HTMLImageElement;

    await expect(service.render(canvas, 'hello', { logo })).resolves.toBeUndefined();
  });

  it('exports PNG with toDataURL("image/png")', () => {
    const canvas = fakeCanvas();

    const url = service.toDataUrl(canvas, 'image/png');

    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(url).toBe('data:image/png;base64,fake');
  });

  it('exports JPEG with an explicit quality argument', () => {
    const canvas = fakeCanvas();

    service.toDataUrl(canvas, 'image/jpeg');

    expect(canvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.92);
  });
});
