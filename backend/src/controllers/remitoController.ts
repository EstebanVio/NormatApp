import { Response } from 'express';
import { AuthRequest } from '../types';
import remitoService from '../services/remitoService';

export async function createRemito(req: AuthRequest, res: Response) {
  try {
    const { numero, cliente, direccion, observaciones, transporteId } = req.body;
    const file = req.file;

    if (!numero) {
      return res.status(400).json({ error: 'El número de remito es requerido' });
    }

    const remito = await remitoService.createRemito({
      numero,
      cliente: cliente || 'Cliente pendiente',
      direccion: direccion || 'Dirección pendiente',
      observaciones,
      archivoBuffer: file?.buffer,
      archivoFilename: file?.originalname,
      transporteId,
    });

    if (req.user) {
      await remitoService.createAuditLog(req.user.sub, remito.id, 'REMITO_CREADO', {
        numero: remito.numero,
      });
    }

    res.status(201).json(remito);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getRemitos(req: AuthRequest, res: Response) {
  try {
    const { estado, transporteId, page, limit } = req.query;
    let targetTransporteId = transporteId as string;

    // Si es conductor, forzar su propio transporteId
    if (req.user?.role === 'DRIVER') {
      if (!req.user.transporteId) {
        return res.status(403).json({ error: 'Usuario conductor sin transporte asignado' });
      }
      targetTransporteId = req.user.transporteId;
    }

    const result = await remitoService.getRemitos({
      estado: estado as string,
      transporteId: targetTransporteId,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getRemitoById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const remito = await remitoService.getRemitoById(id);

    res.status(200).json(remito);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function assignRemito(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { transporteId } = req.body;

    if (!transporteId) {
      return res.status(400).json({ error: 'transporteId requerido' });
    }

    const remito = await remitoService.assignRemito(id, transporteId);

    if (req.user) {
      await remitoService.createAuditLog(req.user.sub, id, 'REMITO_ASIGNADO', {
        transporteId,
      });
    }

    res.status(200).json(remito);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteRemito(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    await remitoService.deleteRemito(id);

    if (req.user) {
      await remitoService.createAuditLog(req.user.sub, id, 'REMITO_ELIMINADO');
    }

    res.status(200).json({ message: 'Remito eliminado' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
