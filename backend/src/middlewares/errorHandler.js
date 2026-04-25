export const errorHandler = (err, req, res, next) => {
  console.error('🔥 Global Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  
  // Jangan bocorkan detail error database (Prisma) ke client saat production
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Terjadi kesalahan internal pada server'
    : err.message || 'Terjadi kesalahan internal pada server';

  res.status(statusCode).json({
    success: false,
    message: message
  });
};
