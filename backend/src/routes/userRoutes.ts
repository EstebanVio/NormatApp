import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

router.post('/', authMiddleware, requireRole(['ADMIN']), userController.crearUsuario);
router.get('/', authMiddleware, requireRole(['ADMIN']), userController.obtenerUsuarios);
router.get('/:id', authMiddleware, requireRole(['ADMIN']), userController.obtenerUsuarioById);
router.put('/:id', authMiddleware, requireRole(['ADMIN']), userController.actualizarUsuario);
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), userController.eliminarUsuario);
router.post('/:id/cambiar-rol', authMiddleware, requireRole(['ADMIN']), userController.cambiarRol);

export default router;
