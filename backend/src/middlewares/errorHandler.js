export const errorHandler = (err, req, res, next) => {
  console.error('🔥 Global Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';

  res.status(statusCode).json({
    success: false,
    message: message
  });
};
