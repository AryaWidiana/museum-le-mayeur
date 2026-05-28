import prisma from '../utils/prisma.js';
import { logAdminAction } from '../utils/logger.js';

// GET /api/activities — Ambil semua kegiatan (terbaru lebih dulu)
export const getActivities = async (req, res, next) => {
  try {
    const activities = await prisma.adminActivity.findMany({
      where: {
        status: {
          in: ['Buka', 'Libur', 'Tutup']
        }
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
    const { date, desc, status } = req.body;

    if (!date || !desc || !status) {
      return res.status(400).json({
        success: false,
        message: 'Field date, desc, dan status wajib diisi',
      });
    }

    const validStatuses = ['Buka', 'Libur', 'Tutup'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status harus salah satu dari: ${validStatuses.join(', ')}`,
      });
    }

    const activity = await prisma.adminActivity.create({
      data: {
        date: new Date(date),
        desc,
        status,
      },
    });

    await logAdminAction('CREATE', `Admin menambahkan kegiatan baru: ${desc} dengan status ${status}`);

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
      return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan' });
    }

    await prisma.adminActivity.delete({ where: { id: activityId } });

    await logAdminAction('DELETE', `Admin menghapus kegiatan: ${existing.desc}`);

    res.status(200).json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
