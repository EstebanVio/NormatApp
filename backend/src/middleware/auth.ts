import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../utils/logger';

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.slice(7);

    const payload = await verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    logger.error('Auth middleware error:', { error });
    return res.status(401).json({ error: 'Autenticación fallida' });
  }
}

export function requireRole(allowedRoles: Array<'ADMIN' | 'OPERATOR' | 'DRIVER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Acceso denegado por rol:', {
        userId: req.user.sub,
        role: req.user.role,
        required: allowedRoles,
      });
      return res.status(403).json({ error: 'Permiso denegado' });
    }

    next();
  };
}
