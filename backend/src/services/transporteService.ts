import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class TransporteService {
  async crearTransporte(nombre: string) {
    const transporte = await prisma.transporte.create({
      data: {
        nombre,
        activo: true,
      },
    });

    logger.info('Transporte creado:', { transporteId: transporte.id, nombre });
    return transporte;
  }

  async obtenerTransportes(activos = true) {
    return prisma.transporte.findMany({
      where: activos ? { activo: true } : {},
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        remitos: {
          select: {
            id: true,
            numero: true,
            estado: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerTransporteById(id: string) {
    const transporte = await prisma.transporte.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        remitos: {
          select: {
            id: true,
            numero: true,
            estado: true,
            cliente: true,
          },
        },
      },
    });

    if (!transporte) {
      throw new Error('Transporte no encontrado');
    }

    return transporte;
  }

  async actualizarTransporte(id: string, data: { nombre?: string; activo?: boolean }) {
    const transporte = await prisma.transporte.update({
      where: { id },
      data,
      include: {
        users: true,
        remitos: true,
      },
    });

    logger.info('Transporte actualizado:', { transporteId: id });
    return transporte;
  }

  async eliminarTransporte(id: string) {
    // Desasociar usuarios primero
    await prisma.user.updateMany({
      where: { transporteId: id },
      data: { transporteId: null },
    });

    // Desasociar remitos
    await prisma.remito.updateMany({
      where: { transporteId: id },
      data: { transporteId: null, estado: 'PENDIENTE' },
    });

    await prisma.transporte.delete({
      where: { id },
    });

    logger.info('Transporte eliminado:', { transporteId: id });
  }

  async asignarConductor(transporteId: string, usuarioId: string) {
    const transporte = await prisma.transporte.findUnique({
      where: { id: transporteId },
    });

    if (!transporte) {
      throw new Error('Transporte no encontrado');
    }

    const usuario = await prisma.user.update({
      where: { id: usuarioId },
      data: { transporteId },
      include: {
        transporte: true,
      },
    });

    logger.info('Conductor asignado:', { transporteId, usuarioId });
    return usuario;
  }
}

export default new TransporteService();
