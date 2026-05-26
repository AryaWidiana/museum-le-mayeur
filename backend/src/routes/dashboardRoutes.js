import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getDashboardSummary);

export default router;
