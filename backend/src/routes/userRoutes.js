import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, requireSuperAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, requireSuperAdmin);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
