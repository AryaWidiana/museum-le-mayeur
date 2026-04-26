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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

import logRoutes from './routes/logRoutes.js';

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
app.use('/api/logs', logRoutes);

// --- GLOBAL ERROR HANDLER ---
// Harus diletakkan paling bawah setelah semua routes
app.use(errorHandler);

export default app;
