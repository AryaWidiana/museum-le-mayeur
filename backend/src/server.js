import app from './app.js';

const PORT = process.env.PORT || 5000;

// Vercel serverless environment doesn't need app.listen()
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

// Export untuk Vercel Serverless Functions
export default app;
