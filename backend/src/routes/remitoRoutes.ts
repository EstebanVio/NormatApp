import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as remitoController from '../controllers/remitoController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = (process.env.ALLOWED_MIME_TYPES || 'application/pdf,image/jpeg,image/png').split(',');
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

router.post('/', authMiddleware, requireRole(['ADMIN', 'OPERATOR']), upload.single('archivo'), remitoController.createRemito);
router.get('/', authMiddleware, requireRole(['ADMIN', 'OPERATOR', 'DRIVER']), remitoController.getRemitos);
router.get('/:id', authMiddleware, remitoController.getRemitoById);
router.post('/:id/assign', authMiddleware, requireRole(['ADMIN', 'OPERATOR']), remitoController.assignRemito);
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), remitoController.deleteRemito);

export default router;
