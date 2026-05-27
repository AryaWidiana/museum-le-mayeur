import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import logRoutes from './routes/logRoutes.js';
import userRoutes from './routes/userRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { protect } from './middlewares/authMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Middleware parsing JSON & CORS
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// --- GLOBAL ERROR HANDLER ---
// Harus diletakkan paling bawah setelah semua routes
app.use(errorHandler);

export default app;
