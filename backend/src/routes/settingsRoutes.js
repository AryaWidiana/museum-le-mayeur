import express from 'express';
import { getMuseumStatus, updateMuseumStatus } from '../controllers/settingsController.js';
import { protect, requireSuperAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/status', getMuseumStatus); // public or at least any role can get status
router.post('/status', protect, requireSuperAdmin, updateMuseumStatus);

export default router;
