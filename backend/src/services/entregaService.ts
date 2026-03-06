import { PrismaClient } from '@prisma/client';
import storageService from '../utils/storage';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface CreateEntregaData {
  remitoId: string;
  usuarioId: string;
  nombreReceptor: string;
  firmaBuffer: Buffer;
  fotoBuffer?: Buffer;
  lat: number;
  lng: number;
  ipAddress?: string;
  userAgent?: string;
}

export class EntregaService {
  async registrarEntrega(data: CreateEntregaData) {
    // Validar remito existe y está asignado
    const remito = await prisma.remito.findUnique({
      where: { id: data.remitoId },
      include: {
        entregas: true,
      },
    });

    if (!remito) {
      throw new Error('Remito no encontrado');
    }

    if (remito.estado === 'ENTREGADO') {
      throw new Error('El remito ya fue entregado');
    }

    // Validar que sea el conductor asignado
    const usuario = await prisma.user.findUnique({
      where: { id: data.usuarioId },
    });

    if (!usuario || usuario.transporteId !== remito.transporteId) {
      throw new Error('No autorizado para entregar este remito');
    }

    let firmaUrl: string | null = null;
    let firmaKey: string | null = null;
    let fotoUrl: string | null = null;
    let fotoKey: string | null = null;

    try {
      // Guardar firma
      const firmaResult = await storageService.uploadFile(data.firmaBuffer, {
        folder: 'entregas/firmas',
      });
      firmaUrl = firmaResult.url;
      firmaKey = firmaResult.key;

      // Guardar foto si existe
      if (data.fotoBuffer) {
        const fotoResult = await storageService.uploadFile(data.fotoBuffer, {
          folder: 'entregas/fotos',
        });
        fotoUrl = fotoResult.url;
        fotoKey = fotoResult.key;
      }
    } catch (error) {
      logger.error('Error al guardar archivos de entrega:', { error });
      throw new Error('Error al guardar archivos de entrega');
    }

    // Crear entrega
    const entrega = await prisma.$transaction(async (tx: any) => {
      const newEntrega = await tx.entrega.create({
        data: {
          remitoId: data.remitoId,
          usuarioId: data.usuarioId,
          nombreReceptor: data.nombreReceptor,
          firmaUrl,
          firmaKey,
          fotoUrl,
          fotoKey,
          lat: data.lat,
          lng: data.lng,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
        include: {
          remito: true,
          usuario: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Actualizar estado del remito
      await tx.remito.update({
        where: { id: data.remitoId },
        data: { estado: 'ENTREGADO' },
      });

      return newEntrega;
    });

    logger.info('Entrega registrada:', {
      entregaId: entrega.id,
      remitoId: data.remitoId,
      conductor: usuario.name,
    });

    return entrega;
  }

  async getEntregasByRemito(remitoId: string) {
    const entregas = await prisma.entrega.findMany({
      where: { remitoId },
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return entregas;
  }

  async getEntregasByDriver(usuarioId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [entregas, total] = await Promise.all([
      prisma.entrega.findMany({
        where: { usuarioId },
        include: {
          remito: {
            select: {
              id: true,
              numero: true,
              cliente: true,
              direccion: true,
              estado: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.entrega.count({ where: { usuarioId } }),
    ]);

    return {
      entregas,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getEntregaById(id: string) {
    const entrega = await prisma.entrega.findUnique({
      where: { id },
      include: {
        remito: {
          select: {
            id: true,
            numero: true,
            cliente: true,
            direccion: true,
            observaciones: true,
          },
        },
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!entrega) {
      throw new Error('Entrega no encontrada');
    }

    return entrega;
  }
}

export default new EntregaService();
