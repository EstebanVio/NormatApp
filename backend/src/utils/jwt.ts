import { SignJWT, jwtVerify } from 'jose';
import logger from './logger';
import { TokenPayload } from '../types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret');

export type JWTPayload = Omit<TokenPayload, 'iat' | 'exp'>;

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export async function createTokens(payload: JWTPayload): Promise<Tokens> {
  try {
    const now = Math.floor(Date.now() / 1000);

    const accessToken = await new SignJWT({ ...payload } as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(process.env.JWT_EXPIRY || '24h')
      .sign(secret);

    const refreshToken = await new SignJWT({ ...payload } as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(process.env.JWT_REFRESH_EXPIRY || '7d')
      .sign(refreshSecret);

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Error creando tokens:', { error });
    throw new Error('Error al generar tokens');
  }
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const verified = await jwtVerify(token, secret);
    return {
      sub: String(verified.payload.sub),
      email: String(verified.payload.email),
      role: verified.payload.role as 'ADMIN' | 'OPERATOR' | 'DRIVER',
      transporteId: verified.payload.transporteId ? String(verified.payload.transporteId) : undefined,
      iat: verified.payload.iat || Math.floor(Date.now() / 1000),
      exp: verified.payload.exp || Math.floor(Date.now() / 1000) + 86400,
    };
  } catch (error) {
    logger.error('Error verificando access token:', { error });
    throw new Error('Token inválido o expirado');
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    const verified = await jwtVerify(token, refreshSecret);
    return {
      sub: String(verified.payload.sub),
      email: String(verified.payload.email),
      role: verified.payload.role as 'ADMIN' | 'OPERATOR' | 'DRIVER',
      transporteId: verified.payload.transporteId ? String(verified.payload.transporteId) : undefined,
      iat: verified.payload.iat || Math.floor(Date.now() / 1000),
      exp: verified.payload.exp || Math.floor(Date.now() / 1000) + 604800,
    };
  } catch (error) {
    logger.error('Error verificando refresh token:', { error });
    throw new Error('Refresh token inválido o expirado');
  }
}
