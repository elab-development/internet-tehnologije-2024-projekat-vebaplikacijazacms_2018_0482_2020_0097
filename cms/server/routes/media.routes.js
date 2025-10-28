import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { uploadImage } from '../controllers/media.controller.js';

const router = Router();
const upload = multer({ dest: 'tmp/' });

router.use(requireAuth);
router.post('/upload', upload.single('file'), uploadImage);

export default router;
