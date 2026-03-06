import { Response } from 'express';
import { AuthRequest } from '../types';
import entregaService from '../services/entregaService';

export async function registrarEntrega(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { remitoId, nombreReceptor, firmaBase64, fotoBase64, lat, lng } = req.body;

    if (!remitoId || !nombreReceptor || !firmaBase64 || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Convertir base64 a buffer
    const firmaBuffer = Buffer.from(firmaBase64, 'base64');
    let fotoBuffer: Buffer | undefined;

    if (fotoBase64) {
      fotoBuffer = Buffer.from(fotoBase64, 'base64');
    }

    const entrega = await entregaService.registrarEntrega({
      remitoId,
      usuarioId: req.user.sub,
      nombreReceptor,
      firmaBuffer,
      fotoBuffer,
      lat,
      lng,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json(entrega);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getEntregasByRemito(req: AuthRequest, res: Response) {
  try {
    const { remitoId } = req.params;

    const entregas = await entregaService.getEntregasByRemito(remitoId);

    res.status(200).json(entregas);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getEntregasByDriver(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { page, limit } = req.query;

    const result = await entregaService.getEntregasByDriver(
      req.user.sub,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getEntregaById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const entrega = await entregaService.getEntregaById(id);

    res.status(200).json(entrega);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
