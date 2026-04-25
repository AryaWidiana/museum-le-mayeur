import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { protect } from './middlewares/authMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middleware parsing JSON & CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://domain-anda.com'] 
    : 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/profile', profileRoutes);

// --- GLOBAL ERROR HANDLER ---
// Harus diletakkan paling bawah setelah semua routes
app.use(errorHandler);

export default app;
