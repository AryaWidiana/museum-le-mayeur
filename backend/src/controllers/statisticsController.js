import prisma from '../utils/prisma.js';

export const getStatistics = async (req, res) => {
  try {
    // 1. Jumlah pengunjung per kategori tiket (WNI / WNA)
    // Karena Prisma tidak bisa groupBy relasi secara langsung, kita fetch lalu grouping secara manual
    const allTransactions = await prisma.transaction.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const categoryMap = {};
    const dailyMap = {};

    allTransactions.forEach(t => {
      // Hitung per kategori WNI/WNA
      const type = t.category?.type || 'WNI';
      if (!categoryMap[type]) {
        categoryMap[type] = 0;
      }
      categoryMap[type] += 1; // 1 tiket per transaksi

      // Hitung per hari
      const dateString = t.createdAt.toISOString().split('T')[0];
      if (!dailyMap[dateString]) {
        dailyMap[dateString] = 0;
      }
      dailyMap[dateString] += 1; // 1 tiket per transaksi
    });

    const pengunjungPerKategori = Object.keys(categoryMap).map(type => ({
      kategori: type,
      totalPengunjung: categoryMap[type]
    }));

    const pengunjungPerHari = Object.keys(dailyMap).map(date => ({
      tanggal: date,
      totalPengunjung: dailyMap[date]
    }));

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data statistik',
      data: {
        pengunjungPerKategori,
        pengunjungPerHari
      }
    });

  } catch (error) {
    console.error('Statistics Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memuat statistik' });
  }
};
