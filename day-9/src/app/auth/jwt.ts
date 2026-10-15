import { JwtPayload, Role } from './models';

/**
 * A JWT's header and payload are just base64url-encoded JSON — that's what
 * makes it inspectable client-side without a secret. There's no backend here
 * to sign one for real, so this mimics the *shape* of a JWT (three dot-
 * separated base64url segments, a decodable payload with iat/exp) without a
 * cryptographic signature. See the README for why that's fine for this
 * exercise and exactly where it would stop being fine.
 */

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return atob(padded + padding);
}

export function createMockJwt(subject: string, role: Role, ttlSeconds: number): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = { alg: 'none', typ: 'JWT' };
  const payload: JwtPayload = { sub: subject, role, iat: issuedAt, exp: issuedAt + ttlSeconds };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode('mock-signature');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number') {
      return null;
    }
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 <= Date.now();
}
