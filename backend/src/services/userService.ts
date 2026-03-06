import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class UserService {
  async crearUsuario(email: string, name: string, password: string, role: string, transporteId?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new Error('El correo ya está registrado');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: role as any,
        transporteId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        transporte: true,
      },
    });

    logger.info('Usuario creado:', { userId: user.id, email, role });
    return user;
  }

  async obtenerUsuarios(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          transporte: {
            select: {
              id: true,
              nombre: true,
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async obtenerUsuarioById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        transporte: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  async actualizarUsuario(id: string, data: { name?: string; email?: string; role?: string; transporteId?: string | null }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(data.role && { role: data.role as any }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        transporte: true,
      },
    });

    logger.info('Usuario actualizado:', { userId: id });
    return user;
  }

  async eliminarUsuario(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { entregas: true } } },
    });

    if (!user) throw new Error('Usuario no encontrado');

    // Si tiene entregas, no podemos borrarlo (integridad referencial)
    if (user._count.entregas > 0) {
      throw new Error('No se puede eliminar un usuario con entregas registradas. Considere desactivarlo.');
    }

    // Desasociar remitos si es conductor
    if (user.role === 'DRIVER') {
      await prisma.remito.updateMany({
        where: { transporte: { users: { some: { id } } } },
        data: { estado: 'PENDIENTE' },
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    logger.info('Usuario eliminado:', { userId: id });
  }

  async cambiarRol(userId: string, nuevoRol: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: nuevoRol as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    logger.info('Rol actualizado:', { userId, nuevoRol });
    return user;
  }
}

export default new UserService();
