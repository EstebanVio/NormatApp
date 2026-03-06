import { PrismaClient } from '@prisma/client';
import storageService from '../utils/storage';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface CreateRemitoData {
  numero: string;
  cliente: string;
  direccion: string;
  observaciones?: string;
  archivoBuffer?: Buffer;
  archivoFilename?: string;
  transporteId?: string;
}

export class RemitoService {
  async createRemito(data: CreateRemitoData) {
    // Validar número único
    const existingRemito = await prisma.remito.findUnique({
      where: { numero: data.numero },
    });

    if (existingRemito) {
      throw new Error('El número de remito ya existe');
    }

    let archivoUrl: string | null = null;
    let archivoKey: string | null = null;

    if (data.archivoBuffer) {
      try {
        const result = await storageService.uploadFile(data.archivoBuffer, {
          folder: 'remitos',
          filename: data.archivoFilename,
        });
        archivoUrl = result.url;
        archivoKey = result.key;
      } catch (error) {
        logger.error('Error al subir archivo del remito:', { error });
        throw new Error('Error al guardar archivo del remito');
      }
    }

    const remito = await prisma.remito.create({
      data: {
        numero: data.numero,
        cliente: data.cliente,
        direccion: data.direccion,
        observaciones: data.observaciones,
        archivoUrl,
        archivoKey,
        transporteId: data.transporteId,
      },
      include: {
        transporte: true,
      },
    });

    logger.info('Remito creado:', { remitoId: remito.id, numero: remito.numero });

    return remito;
  }

  async getRemitos(
    filters?: {
      estado?: string;
      transporteId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.estado) {
      where.estado = filters.estado;
    }
    if (filters?.transporteId) {
      where.transporteId = filters.transporteId;
    }

    const [remitos, total] = await Promise.all([
      prisma.remito.findMany({
        where,
        include: {
          transporte: true,
          entregas: {
            select: {
              id: true,
              nombreReceptor: true,
              fechaEntrega: true,
            },
          },
        },
        orderBy: { fechaCreacion: 'desc' },
        skip,
        take: limit,
      }),
      prisma.remito.count({ where }),
    ]);

    return {
      remitos,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getRemitoById(id: string) {
    const remito = await prisma.remito.findUnique({
      where: { id },
      include: {
        transporte: true,
        entregas: {
          include: {
            usuario: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!remito) {
      throw new Error('Remito no encontrado');
    }

    return remito;
  }

  async assignRemito(remitoId: string, transporteId: string) {
    const remito = await prisma.remito.findUnique({
      where: { id: remitoId },
    });

    if (!remito) {
      throw new Error('Remito no encontrado');
    }

    const transporte = await prisma.transporte.findUnique({
      where: { id: transporteId },
    });

    if (!transporte || !transporte.activo) {
      throw new Error('Transporte no válido o inactivo');
    }

    const updated = await prisma.remito.update({
      where: { id: remitoId },
      data: {
        transporteId,
        estado: 'ASIGNADO',
      },
      include: {
        transporte: true,
      },
    });

    logger.info('Remito asignado:', {
      remitoId,
      transporteId,
      numero: remito.numero,
    });

    return updated;
  }

  async deleteRemito(remitoId: string) {
    const remito = await prisma.remito.findUnique({
      where: { id: remitoId },
    });

    if (!remito) {
      throw new Error('Remito no encontrado');
    }

    if (remito.archivoKey) {
      await storageService.deleteFile(remito.archivoKey);
    }

    await prisma.remito.delete({
      where: { id: remitoId },
    });

    logger.info('Remito eliminado:', { remitoId, numero: remito.numero });
  }

  async createAuditLog(userId: string, remitoId: string, accion: string, meta?: any) {
    await prisma.auditLog.create({
      data: {
        usuarioId: userId,
        remitoId,
        accion,
        metaJson: meta ? JSON.stringify(meta) : null,
      },
    });
  }
}

export default new RemitoService();
