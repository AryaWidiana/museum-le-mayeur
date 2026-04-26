import prisma from '../utils/prisma.js';

export const getDashboardSummary = async (req, res) => {
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

    // 1. Hitung total transaksi
    const totalTransaction = await prisma.transaction.count({ where });
    
    // 2. Agregasi untuk menghitung total pendapatan
    const aggregations = await prisma.transaction.aggregate({
      where,
      _sum: {
        totalPrice: true
      }
    });

    const totalRevenue = aggregations._sum.totalPrice || 0;

    // 3. Ambil data transaksi beserta kategori (optimized: select only needed columns)
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        totalPrice: true,
        payment: true,
        createdAt: true,
        category: { select: { name: true, type: true } }
      }
    });

    // 4. Data Weekly Chart (7 Hari Terakhir)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTransactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, totalPrice: true }
    });

    const daysName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const weeklyDataMap = {};
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStrNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayStrNum}`;
      
      const dayStr = daysName[d.getDay()];
      weeklyDataMap[dateStr] = { day: dayStr, value: 0 };
    }

    weeklyTransactions.forEach(t => {
      const d = new Date(t.createdAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStrNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayStrNum}`;

      if (weeklyDataMap[dateStr]) {
        weeklyDataMap[dateStr].value += t.totalPrice;
      }
    });

    const weeklyData = Object.values(weeklyDataMap);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil ringkasan dashboard',
      data: {
        totalTransaction,
        totalRevenue,
        transactions,
        weeklyData
      }
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memuat dashboard' });
  }
};
