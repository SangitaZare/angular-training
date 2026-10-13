export interface CurrentUser {
  username: string;
}

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}
