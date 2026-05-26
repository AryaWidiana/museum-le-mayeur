import express from 'express';
import { login, register, getMe, updateMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint: POST /api/auth/register
router.post('/register', register);

// Endpoint: POST /api/auth/login
router.post('/login', login);

// Endpoint: GET /api/auth/me — Profil admin yang sedang login (butuh token)
router.get('/me', protect, getMe);

// Endpoint: PATCH /api/auth/me — Update nama / foto profil
router.patch('/me', protect, updateMe);

export default router;

