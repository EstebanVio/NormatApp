import { Response } from 'express';
import { AuthRequest } from '../types';
import userService from '../services/userService';

export async function crearUsuario(req: AuthRequest, res: Response) {
  try {
    const { email, name, password, role, transporteId } = req.body;

    if (!email || !name || !password || !role) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const usuario = await userService.crearUsuario(email, name, password, role, transporteId);

    res.status(201).json(usuario);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function obtenerUsuarios(req: AuthRequest, res: Response) {
  try {
    const { page, limit } = req.query;

    const result = await userService.obtenerUsuarios(
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function obtenerUsuarioById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const usuario = await userService.obtenerUsuarioById(id);

    res.status(200).json(usuario);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function actualizarUsuario(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, role, transporteId } = req.body;

    const usuario = await userService.actualizarUsuario(id, {
      name,
      email,
      role,
      transporteId,
    });

    res.status(200).json(usuario);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function eliminarUsuario(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    await userService.eliminarUsuario(id);

    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function cambiarRol(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { nuevoRol } = req.body;

    if (!nuevoRol) {
      return res.status(400).json({ error: 'nuevoRol requerido' });
    }

    const usuario = await userService.cambiarRol(id, nuevoRol);

    res.status(200).json(usuario);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
