import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

import { createMockJwt, decodeJwt, isExpired } from './jwt';
import { Project } from '../store/projects/project.model';

const MOCK_USERS: Record<string, string> = {
  admin: 'admin123',
  user: 'user123',
};

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Dashboard Redesign', owner: 'Maya Chen', status: 'active', updatedAt: '2026-09-28' },
  { id: '2', name: 'Auth Service Migration', owner: 'Jordan Lee', status: 'active', updatedAt: '2026-09-30' },
  { id: '3', name: 'Mobile Onboarding', owner: 'Priya Patel', status: 'completed', updatedAt: '2026-09-18' },
  { id: '4', name: 'Billing Integration', owner: 'Sam Okafor', status: 'on-hold', updatedAt: '2026-09-10' },
  { id: '5', name: 'Analytics Pipeline', owner: 'Maya Chen', status: 'completed', updatedAt: '2026-09-22' },
  { id: '6', name: 'Design System v2', owner: 'Jordan Lee', status: 'active', updatedAt: '2026-10-01' },
];

const TOKEN_TTL_SECONDS = 3600;
const SIMULATED_LATENCY_MS = 300;

/**
 * Stands in for a real backend so the login form and the NgRx projects
 * effect have something to talk to, the same role Day 9's mock backend
 * played for its login form. It only answers the two routes below;
 * anything else falls through to `next(req)` untouched.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    return handleLogin(req.body as { username?: string; password?: string } | null);
  }

  if (req.method === 'GET' && req.url === '/api/projects') {
    return handleProtected(req, () => MOCK_PROJECTS);
  }

  return next(req);
};

function handleLogin(body: { username?: string; password?: string } | null) {
  const username = body?.username ?? '';
  const password = body?.password ?? '';

  if (MOCK_USERS[username] !== password) {
    return unauthorized('Invalid username or password.');
  }

  const token = createMockJwt(username, TOKEN_TTL_SECONDS);
  return of(new HttpResponse({ status: 200, body: { token } })).pipe(delay(SIMULATED_LATENCY_MS));
}

function handleProtected(req: HttpRequest<unknown>, body: () => unknown) {
  const header = req.headers.get('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  const payload = token ? decodeJwt(token) : null;

  if (!payload || isExpired(payload)) {
    return unauthorized('Missing or expired token.');
  }

  return of(new HttpResponse({ status: 200, body: body() })).pipe(delay(SIMULATED_LATENCY_MS));
}

function unauthorized(message: string) {
  return throwError(
    () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', error: { message } }),
  ).pipe(delay(SIMULATED_LATENCY_MS));
}
