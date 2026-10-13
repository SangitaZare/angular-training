import { TestBed } from '@angular/core/testing';
import { toCanvas } from 'qrcode';

import { QrCodeService } from './qr-code.service';

// jsdom's <canvas> has no real rendering backend (getContext('2d') returns
// null without the native `canvas` package), so these tests never touch a
// real HTMLCanvasElement — they pass a plain object shaped like one and
// assert on the calls this service makes, not on actual pixels.
vi.mock('qrcode', () => ({ toCanvas: vi.fn().mockResolvedValue(undefined) }));

function fakeCanvas() {
  return {
    width: 240,
    height: 240,
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

  it('renders the given text onto the canvas', async () => {
    const canvas = fakeCanvas();

    await service.render(canvas, 'https://example.com/dashboard');

    expect(toCanvas).toHaveBeenCalledWith(
      canvas,
      'https://example.com/dashboard',
      expect.objectContaining({ width: 240 }),
    );
  });

  it('exports the rendered canvas as a PNG data URL', () => {
    const canvas = fakeCanvas();

    const url = service.toDataUrl(canvas);

    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(url).toBe('data:image/png;base64,fake');
  });
});
