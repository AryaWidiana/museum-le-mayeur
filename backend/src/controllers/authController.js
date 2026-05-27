import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;

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
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/auth/me — Profil admin yang sedang login
export const getMe = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        profilePic: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// PATCH /api/auth/me — Update nama dan/atau foto profil
export const updateMe = async (req, res) => {
  try {
    const { name, profilePic } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (profilePic !== undefined) updateData.profilePic = profilePic; // base64 data URL

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diperbarui' });
    }

    const updated = await prisma.admin.update({
      where: { id: req.admin.id },
      data: updateData,
      select: { id: true, username: true, name: true, role: true, profilePic: true, createdAt: true },
    });

    res.status(200).json({ success: true, message: 'Profil berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('UpdateMe Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

