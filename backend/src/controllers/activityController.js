import prisma from '../utils/prisma.js';
import { logAdminAction } from '../utils/logger.js';

// GET /api/activities — Ambil semua kegiatan (terbaru lebih dulu)
export const getActivities = async (req, res, next) => {
  try {
    const { year, month, global } = req.query;
    
    let dateFilter = {};
    if (year && month) {
      const y = parseInt(year);
      const m = parseInt(month) - 1; // JS month is 0-indexed
      const startOfMonth = new Date(y, m, 1);
      const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
      dateFilter = { gte: startOfMonth, lte: endOfMonth };
    }

    const where = { status: 'Libur' };
    if (Object.keys(dateFilter).length > 0) {
      where.date = dateFilter;
    }

    // Jika user bukan SUPER_ADMIN atau tidak meminta global, filter berdasar adminId sendiri
    if (!(req.admin.role === 'SUPER_ADMIN' && global === 'true')) {
      where.adminId = req.admin.id;
    }

    const activities = await prisma.adminActivity.findMany({
      where,
      include: {
        admin: { select: { username: true, name: true } }
      },
      orderBy: { date: 'desc' },
    });
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

// POST /api/activities — Tambah kegiatan baru
export const createActivity = async (req, res, next) => {
  try {
    const { date, desc } = req.body;

    if (!date || !desc) {
      return res.status(400).json({
        success: false,
        message: 'Field tanggal dan alasan libur wajib diisi',
      });
    }

    const activity = await prisma.adminActivity.create({
      data: {
        date: new Date(date),
        desc,
        status: 'Libur',
        adminId: req.admin.id
      },
      include: {
        admin: { select: { username: true, name: true } }
      }
    });

    await logAdminAction('CREATE', `Admin mengajukan libur: ${desc}`);

    res.status(201).json({
      success: true,
      message: 'Kegiatan berhasil ditambahkan',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/activities/:id — Hapus kegiatan by ID
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activityId = parseInt(id);

    if (isNaN(activityId)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const existing = await prisma.adminActivity.findUnique({
      where: { id: activityId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    }

    // Validasi kepemilikan (hanya admin pemilik atau super_admin yang bisa hapus)
    if (existing.adminId !== req.admin.id && req.admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan menghapus jadwal orang lain' });
    }

    await prisma.adminActivity.delete({ where: { id: activityId } });

    await logAdminAction('DELETE', `Admin menghapus kegiatan: ${existing.desc}`);

    res.status(200).json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
