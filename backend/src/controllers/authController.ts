import { Response } from 'express';
import { AuthRequest } from '../types';
import authService from '../services/authService';
import { createTokens, verifyRefreshToken } from '../utils/jwt';

export async function register(req: AuthRequest, res: Response) {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await authService.register(email, name, password);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const result = await authService.login(email, password);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}

export async function refreshToken(req: AuthRequest, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const payload = await verifyRefreshToken(refreshToken);

    const tokens = await createTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    res.status(200).json(tokens);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await authService.getCurrentUser(req.user.sub);

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseñas requeridas' });
    }

    await authService.updatePassword(req.user.sub, currentPassword, newPassword);

    res.status(200).json({ message: 'Contraseña actualizada' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
