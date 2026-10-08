import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

import { createMockJwt, decodeJwt, isExpired } from './jwt';
import { Role } from './models';

const MOCK_USERS: Record<string, { password: string; role: Role }> = {
  admin: { password: 'admin123', role: 'admin' },
  user: { password: 'user123', role: 'user' },
};

const TOKEN_TTL_SECONDS = 3600;
const SIMULATED_LATENCY_MS = 300;

/**
 * Stands in for a real backend so the login form and authInterceptor have
 * something to talk to. It only answers the three routes below; anything
 * else falls through to `next(req)` untouched, so swapping in a real
 * backend later would mean deleting this file, not touching the rest of
 * the app.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    return handleLogin(req.body as { username?: string; password?: string } | null);
  }

  if (req.method === 'GET' && req.url === '/api/profile') {
    return handleProtected(req, () => ({
      message: 'This came from a protected endpoint — you only see it because a valid token was attached.',
    }));
  }

  if (req.method === 'GET' && req.url === '/api/admin/stats') {
    return handleProtected(
      req,
      () => ({ totalUsers: Object.keys(MOCK_USERS).length, uptimeHours: 42 }),
      'admin',
    );
  }

  return next(req);
};

function handleLogin(body: { username?: string; password?: string } | null) {
  const username = body?.username ?? '';
  const password = body?.password ?? '';
  const account = MOCK_USERS[username];

  if (!account || account.password !== password) {
    return unauthorized('Invalid username or password.');
  }

  const token = createMockJwt(username, account.role, TOKEN_TTL_SECONDS);
  return of(new HttpResponse({ status: 200, body: { token } })).pipe(delay(SIMULATED_LATENCY_MS));
}

function handleProtected(req: HttpRequest<unknown>, body: () => unknown, requiredRole?: Role) {
  const header = req.headers.get('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  const payload = token ? decodeJwt(token) : null;

  if (!payload || isExpired(payload)) {
    return unauthorized('Missing or expired token.');
  }

  if (requiredRole && payload.role !== requiredRole) {
    return forbidden(`This endpoint requires the '${requiredRole}' role.`);
  }

  return of(new HttpResponse({ status: 200, body: body() })).pipe(delay(SIMULATED_LATENCY_MS));
}

function unauthorized(message: string) {
  return throwError(
    () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', error: { message } }),
  ).pipe(delay(SIMULATED_LATENCY_MS));
}

function forbidden(message: string) {
  return throwError(
    () => new HttpErrorResponse({ status: 403, statusText: 'Forbidden', error: { message } }),
  ).pipe(delay(SIMULATED_LATENCY_MS));
}
