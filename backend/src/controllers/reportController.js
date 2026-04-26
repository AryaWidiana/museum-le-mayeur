import prisma from '../utils/prisma.js';

export const getReport = async (req, res) => {
  try {
    const { timeTab } = req.query; // 'Hari Ini', 'Bulan Ini', 'Tahun Ini'

    const where = {};
    const now = new Date();
    
    if (timeTab === 'Hari Ini') {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      where.createdAt = { gte: today };
    } else if (timeTab === 'Bulan Ini') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfMonth };
    } else if (timeTab === 'Tahun Ini') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfYear };
    }

    const allTransactions = await prisma.transaction.findMany({
      where,
      select: {
        id: true,
        totalPrice: true,
        category: { select: { name: true, type: true } }
      }
    });

    console.log(`[Report] Data ditemukan untuk periode "${timeTab || 'Semua'}":`, allTransactions.length, 'transaksi');

    const wniMap = {};
    const wnaMap = {};

    let totalPendapatanWNI = 0;
    let totalPendapatanWNA = 0;

    allTransactions.forEach(t => {
      const type = t.category?.type || 'WNI';
      const catName = t.category?.name || 'Lainnya';
      const price = t.totalPrice;

      if (type === 'WNI') {
        if (!wniMap[catName]) wniMap[catName] = { jumlah: 0, pendapatan: 0 };
        wniMap[catName].jumlah += 1;
        wniMap[catName].pendapatan += price;
        totalPendapatanWNI += price;
      } else {
        if (!wnaMap[catName]) wnaMap[catName] = { jumlah: 0, pendapatan: 0 };
        wnaMap[catName].jumlah += 1;
        wnaMap[catName].pendapatan += price;
        totalPendapatanWNA += price;
      }
    });

    const formatData = (map, total) => {
      return Object.keys(map).map(kategori => {
        const item = map[kategori];
        const presentase = total > 0 ? Math.round((item.pendapatan / total) * 100) + '%' : '0%';
        return {
          kategori,
          jumlah: item.jumlah,
          pendapatan: item.pendapatan,
          presentase
        };
      });
    };

    // Calculate daily average
    let dayCount = 1;
    if (timeTab === 'Bulan Ini') {
        dayCount = now.getDate();
    } else if (timeTab === 'Tahun Ini') {
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        dayCount = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    const totalPendapatan = totalPendapatanWNI + totalPendapatanWNA;
    const rataRataHarian = Math.round(totalPendapatan / (dayCount || 1));

    res.status(200).json({
      success: true,
      data: {
        detailKategoriWNI: formatData(wniMap, totalPendapatanWNI),
        detailKategoriWNA: formatData(wnaMap, totalPendapatanWNA),
        totalTransaksi: allTransactions.length,
        totalPendapatan,
        rataRataHarian
      }
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data laporan' });
  }
};
