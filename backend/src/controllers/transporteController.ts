import { Response } from 'express';
import { AuthRequest } from '../types';
import transporteService from '../services/transporteService';

export async function crearTransporte(req: AuthRequest, res: Response) {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    const transporte = await transporteService.crearTransporte(nombre);

    res.status(201).json(transporte);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function obtenerTransportes(req: AuthRequest, res: Response) {
  try {
    const { activos } = req.query;

    const transportes = await transporteService.obtenerTransportes(
      activos !== 'false'
    );

    res.status(200).json(transportes);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function obtenerTransporteById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const transporte = await transporteService.obtenerTransporteById(id);

    res.status(200).json(transporte);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function actualizarTransporte(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;

    if (!nombre && activo === undefined) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un campo' });
    }

    const transporte = await transporteService.actualizarTransporte(id, {
      nombre,
      activo,
    });

    res.status(200).json(transporte);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function eliminarTransporte(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    await transporteService.eliminarTransporte(id);

    res.status(200).json({ message: 'Transporte eliminado' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function asignarConductor(req: AuthRequest, res: Response) {
  try {
    const { transporteId, usuarioId } = req.body;

    if (!transporteId || !usuarioId) {
      return res.status(400).json({ error: 'transporteId y usuarioId requeridos' });
    }

    const usuario = await transporteService.asignarConductor(transporteId, usuarioId);

    res.status(200).json(usuario);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
