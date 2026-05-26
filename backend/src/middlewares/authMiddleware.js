import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

export const protect = (req, res, next) => {
  let token;

  // Periksa apakah token ada di header Authorization dengan format "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil token dari header
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Simpan data admin yang ter-decode ke object request agar bisa diakses di controller
      req.admin = decoded;

      return next(); // Lanjutkan ke handler/controller berikutnya
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return res.status(401).json({ success: false, message: 'Sesi tidak valid, otorisasi gagal' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Tidak ada token, otorisasi ditolak' });
  }
};
