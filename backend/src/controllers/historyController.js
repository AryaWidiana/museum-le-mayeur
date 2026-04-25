import prisma from '../utils/prisma.js';

export const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { category: true }
    });

    const activities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil riwayat transaksi dan aktivitas admin',
      data: {
        transactions,
        activities
      }
    });
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memuat riwayat' });
  }
};
