import express from 'express';
import { createTransaction, getTransactions, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { protect, requireSuperAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware auth diterapkan pada seluruh endpoint transaksi
// Artinya semua endpoint di bawah ini WAJIB mengirim token JWT dari Admin
router.use(protect);

// Endpoint: POST /api/transactions
router.post('/', createTransaction);

// Endpoint: GET /api/transactions
router.get('/', getTransactions);

// Endpoint: PUT /api/transactions/:id
router.put('/:id', requireSuperAdmin, updateTransaction);

// Endpoint: DELETE /api/transactions/:id
router.delete('/:id', requireSuperAdmin, deleteTransaction);

export default router;
