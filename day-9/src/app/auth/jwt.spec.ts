import { createMockJwt, decodeJwt, isExpired } from './jwt';

describe('jwt', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('round-trips a subject and role through create and decode', () => {
    const token = createMockJwt('admin', 'admin', 3600);
    const payload = decodeJwt(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe('admin');
    expect(payload?.role).toBe('admin');
  });

  it('produces three dot-separated base64url segments, like a real JWT', () => {
    const token = createMockJwt('user', 'user', 3600);

    expect(token.split('.')).toHaveLength(3);
    expect(token).not.toMatch(/[+/=]/);
  });

  it('sets exp to iat plus the requested ttl', () => {
    const token = createMockJwt('user', 'user', 120);
    const payload = decodeJwt(token)!;

    expect(payload.exp - payload.iat).toBe(120);
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
    expect(decodeJwt('a.b')).toBeNull();
    expect(decodeJwt('a.' + btoa('not json') + '.c')).toBeNull();
  });

  it('isExpired is false before exp and true after it', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    const token = createMockJwt('user', 'user', 60);
    const payload = decodeJwt(token)!;
    expect(isExpired(payload)).toBe(false);

    vi.setSystemTime(new Date('2026-01-01T00:01:01Z'));
    expect(isExpired(payload)).toBe(true);
  });
});
