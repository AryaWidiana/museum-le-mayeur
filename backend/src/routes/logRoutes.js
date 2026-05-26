import express from 'express';
import { getLogs } from '../controllers/logController.js';
import { logAdminAction } from '../utils/logger.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Endpoint: GET /api/logs - Hanya untuk baca log
router.get('/', getLogs);

// Endpoint khusus untuk merekam log Export PDF dari frontend
router.post('/export', async (req, res, next) => {
  try {
    const { description } = req.body;
    await logAdminAction('EXPORT', description || 'Admin melakukan Export PDF');
    res.status(200).json({ success: true, message: 'Log export dicatat' });
  } catch (error) {
    next(error);
  }
});

export default router;
