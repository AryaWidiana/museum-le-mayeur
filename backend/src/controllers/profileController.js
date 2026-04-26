import prisma from '../utils/prisma.js';

export const getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        name: true,
        profilePic: true,
        role: true,
        createdAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
    }

    const activities = await prisma.adminActivity.findMany({
      orderBy: { date: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: {
        admin,
        activities
      }
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat profil' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { name, username, profilePic } = req.body;

    // Build the update data object dynamically
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (profilePic !== undefined) updateData.profilePic = profilePic;

    // Handle username update with uniqueness check
    if (username !== undefined) {
      // Check if the new username is already taken by another admin
      const existingAdmin = await prisma.admin.findUnique({
        where: { username }
      });

      if (existingAdmin && existingAdmin.id !== adminId) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan oleh admin lain'
        });
      }

      updateData.username = username;
    }

    const updated = await prisma.admin.update({
      where: { id: Number(adminId) },
      data: updateData,
      select: { id: true, username: true, name: true, profilePic: true, role: true }
    });

    if (username !== undefined || name !== undefined) {
      await prisma.activityLog.create({
        data: {
          type: 'edit',
          title: 'Update Profil',
          detail: `Admin memperbarui profil (username/nama).`
        }
      });
    }

    res.status(200).json({ success: true, message: 'Profil berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil: ' + (error.message || 'Unknown error'), errorDetails: String(error) });
  }
};

export const addActivity = async (req, res) => {
  try {
    const { date, desc, status } = req.body;

    if (!date || !desc || !status) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    const newActivity = await prisma.adminActivity.create({
      data: {
        date: new Date(date),
        desc,
        status
      }
    });

    res.status(201).json({ success: true, message: 'Kegiatan berhasil ditambahkan', data: newActivity });
  } catch (error) {
    console.error('Add Activity Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan kegiatan: ' + (error.message || 'Unknown'), errorDetails: String(error) });
  }
};
