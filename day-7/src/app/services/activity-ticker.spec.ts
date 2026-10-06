import { ActivityTicker } from './activity-ticker';

describe('ActivityTicker', () => {
  let service: ActivityTicker;

  beforeEach(() => {
    service = new ActivityTicker();
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  it('starts at zero', () => {
    expect(service.ticks()).toBe(0);
  });

  it('bump() increments the ticks signal', () => {
    service.bump();
    service.bump();
    expect(service.ticks()).toBe(2);
  });

  it('start() bumps on an interval until stop() is called', () => {
    vi.useFakeTimers();

    service.start(1000);
    expect(service.ticks()).toBe(0);

    vi.advanceTimersByTime(3000);
    expect(service.ticks()).toBe(3);

    service.stop();
    vi.advanceTimersByTime(3000);
    expect(service.ticks()).toBe(3);
  });

  it('start() replaces a previously running interval instead of stacking them', () => {
    vi.useFakeTimers();

    service.start(1000);
    service.start(1000);
    vi.advanceTimersByTime(1000);

    expect(service.ticks()).toBe(1);
  });
});
