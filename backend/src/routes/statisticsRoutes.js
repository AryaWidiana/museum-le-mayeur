import express from 'express';
import { getStatistics } from '../controllers/statisticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getStatistics);

export default router;
