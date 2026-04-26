import express from 'express';
import { createLog } from '../controllers/logController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createLog);

export default router;
