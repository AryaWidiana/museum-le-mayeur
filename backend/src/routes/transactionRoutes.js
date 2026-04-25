import express from 'express';
import { createTransaction, getTransactions } from '../controllers/transactionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware auth diterapkan pada seluruh endpoint transaksi
// Artinya semua endpoint di bawah ini WAJIB mengirim token JWT dari Admin
router.use(protect);

// Endpoint: POST /api/transactions
router.post('/', createTransaction);

// Endpoint: GET /api/transactions
router.get('/', getTransactions);

export default router;
