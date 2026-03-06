import { Request } from 'express';

export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'DRIVER';
  transporteId?: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface S3UploadResult {
  key: string;
  url: string;
  bucket: string;
}
