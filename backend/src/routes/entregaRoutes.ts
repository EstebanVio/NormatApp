import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as entregaController from '../controllers/entregaController';

const router = Router();

router.post('/', authMiddleware, requireRole(['DRIVER']), entregaController.registrarEntrega);
router.get('/remito/:remitoId', authMiddleware, entregaController.getEntregasByRemito);
router.get('/mi-conductor', authMiddleware, requireRole(['DRIVER']), entregaController.getEntregasByDriver);
router.get('/:id', authMiddleware, entregaController.getEntregaById);

export default router;
