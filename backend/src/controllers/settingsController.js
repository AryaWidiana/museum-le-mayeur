import prisma from '../utils/prisma.js';

// GET /api/settings/status
export const getMuseumStatus = async (req, res) => {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      // Default jika belum ada
      return res.status(200).json({ success: true, data: { museumStatus: 'Buka' } });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Get Status Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/settings/status
export const updateMuseumStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status wajib diisi' });
    }

    const settings = await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: { museumStatus: status },
      create: { id: 1, museumStatus: status },
    });

    res.status(200).json({ success: true, message: 'Status berhasil diperbarui', data: settings });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};
