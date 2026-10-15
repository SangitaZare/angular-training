export type Role = 'admin' | 'user';

export interface CurrentUser {
  username: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  iat: number;
  exp: number;
}
