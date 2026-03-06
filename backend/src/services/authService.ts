import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { createTokens } from '../utils/jwt';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, name: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: 'OPERATOR',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    logger.info('Nuevo usuario registrado:', { userId: user.id, email });

    const tokens = await createTokens({
      sub: user.id,
      email: user.email,
      role: user.role as any,
    });

    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        transporteId: true,
      },
    });

    if (!user) {
      logger.warn('Intento de login fallido - usuario no existe:', { email });
      throw new Error('Credenciales inválidas');
    }

    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);

    if (!passwordMatch) {
      logger.warn('Intento de login fallido - contraseña incorrecta:', { email });
      throw new Error('Credenciales inválidas');
    }

    const tokens = await createTokens({
      sub: user.id,
      email: user.email,
      role: user.role as any,
      transporteId: user.transporteId || undefined,
    });

    logger.info('Login exitoso:', { userId: user.id, email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        transporteId: user.transporteId,
      },
      ...tokens,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        transporteId: true,
        transporte: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const passwordMatch = await bcryptjs.compare(currentPassword, user.passwordHash);

    if (!passwordMatch) {
      throw new Error('Contraseña actual incorrecta');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    logger.info('Contraseña actualizada:', { userId });
  }
}

export default new AuthService();
