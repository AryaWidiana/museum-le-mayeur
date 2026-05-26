import express from 'express';
import { getActivities, createActivity, deleteActivity } from '../controllers/activityController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// GET    /api/activities       — Ambil semua kegiatan
router.get('/', getActivities);

// POST   /api/activities       — Buat kegiatan baru
router.post('/', createActivity);

// DELETE /api/activities/:id   — Hapus kegiatan
router.delete('/:id', deleteActivity);

export default router;
