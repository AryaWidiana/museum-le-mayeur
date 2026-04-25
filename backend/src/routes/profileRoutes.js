import express from 'express';
import { getProfile, updateProfile, addActivity } from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/activity', addActivity);

export default router;
