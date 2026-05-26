import express from 'express';
import { getSchedule, updateSchedule } from '../controllers/scheduleController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Middleware auth

router.get('/', getSchedule);
router.put('/', updateSchedule);

export default router;
