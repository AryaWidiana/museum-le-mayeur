import prisma from '../utils/prisma.js';

export const getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    // ── PARALLEL FETCH: Run all 3 queries simultaneously ──
    const [admin, activities, loginLogs] = await Promise.all([
      prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          username: true,
          name: true,
          profilePic: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.adminActivity.findMany({
        orderBy: { date: 'desc' },
        take: 50
      }),
      prisma.activityLog.findMany({
        where: { type: 'login' },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
    }

    // Kalkulasi Kehadiran
    const now = new Date();
    const joinedDate = new Date(admin.createdAt);
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDaysSinceJoined = Math.max(1, Math.ceil((now - joinedDate) / msPerDay));

    const uniqueLoginDates = new Set(
      loginLogs.map(log => new Date(log.createdAt).toDateString())
    );

    const hadirCount = uniqueLoginDates.size;
    const liburCount = Math.max(0, totalDaysSinceJoined - hadirCount);

    res.status(200).json({
      success: true,
      data: {
        admin,
        activities,
        attendance: { hadir: hadirCount, libur: liburCount }
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
    const { name, profilePic } = req.body;

    // Build the update data object dynamically (username is NOT updatable from profile)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (profilePic !== undefined) updateData.profilePic = profilePic;

    const updated = await prisma.admin.update({
      where: { id: Number(adminId) },
      data: updateData,
      select: { id: true, username: true, name: true, profilePic: true, role: true }
    });

    if (name !== undefined) {
      await prisma.activityLog.create({
        data: {
          type: 'edit',
          title: 'Update Profil',
          detail: `Admin memperbarui nama profil menjadi "${name}".`
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

export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.adminActivity.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan' });
    }
    console.error('Delete Activity Error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus kegiatan' });
  }
};
