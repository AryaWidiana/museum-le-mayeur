import bcrypt from 'bcrypt';
import prisma from '../utils/prisma.js';

// GET /api/users
export const getUsers = async (req, res) => {
  try {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const startOfMonth = new Date(y, m, 1);
    const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const users = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        profilePic: true,
        attendances: {
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          select: { date: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const currentDateNum = today.getDate(); // Tanggal hari ini

    const formattedUsers = users.map(user => {
      // Hitung unik attendance per hari (menghindari duplikasi)
      const uniqueHadirDates = new Set(user.attendances.map(a => new Date(a.date).toDateString()));
      const totalHadir = uniqueHadirDates.size;
      
      // Total Libur = (Tanggal Hari Ini) dikurangi (Total Hadir)
      const totalLibur = Math.max(0, currentDateNum - totalHadir);

      const { attendances, ...userData } = user;
      return {
        ...userData,
        stats: {
          hadir: totalHadir,
          libur: totalLibur
        }
      };
    });

    res.status(200).json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/users
export const createUser = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const existingUser = await prisma.admin.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        name: name || 'Admin Museum',
        role: role || 'ADMIN',
      },
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    });

    res.status(201).json({ success: true, message: 'Pengguna berhasil dibuat', data: newUser });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, role, password } = req.body;

    const existingUser = await prisma.admin.findUnique({ where: { id: parseInt(id) } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.admin.findUnique({ where: { username } });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (name !== undefined) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    });

    res.status(200).json({ success: true, message: 'Pengguna berhasil diperbarui', data: updatedUser });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (req.admin.id === parseInt(id)) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri' });
    }

    await prisma.admin.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Delete User Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};
