import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables");
}

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    // Cek jika username sudah ada
    const existingUser = await prisma.admin.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat admin baru
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Admin berhasil didaftarkan',
      data: {
        id: newAdmin.id,
        username: newAdmin.username,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    // Cari user berdasarkan username
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    // Validasi password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: admin.id,
        username: admin.username,
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};
