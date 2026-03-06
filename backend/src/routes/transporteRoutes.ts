import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as transporteController from '../controllers/transporteController';

const router = Router();

// IMPORTANTE: ruta estática debe estar ANTES de las rutas con parámetro /:id
router.post('/asignar-conductor', authMiddleware, requireRole(['ADMIN']), transporteController.asignarConductor);

router.post('/', authMiddleware, requireRole(['ADMIN']), transporteController.crearTransporte);
router.get('/', authMiddleware, transporteController.obtenerTransportes);
router.get('/:id', authMiddleware, transporteController.obtenerTransporteById);
router.put('/:id', authMiddleware, requireRole(['ADMIN']), transporteController.actualizarTransporte);
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), transporteController.eliminarTransporte);

export default router;
