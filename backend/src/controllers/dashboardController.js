import prisma from '../utils/prisma.js';

export const getDashboardSummary = async (req, res) => {
  try {
    // 1. Hitung total transaksi (jumlah struk/record)
    const totalTransaction = await prisma.transaction.count();
    
    // 2. Agregasi untuk menghitung total pendapatan
    const aggregations = await prisma.transaction.aggregate({
      _sum: {
        totalPrice: true
      }
    });

    const totalRevenue = aggregations._sum.totalPrice || 0;

    // 3. Ambil data transaksi beserta kategori
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Ambil 50 data terbaru agar tidak terlalu berat
      include: { category: true }
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil ringkasan dashboard',
      data: {
        totalTransaction,
        totalRevenue,
        transactions
      }
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memuat dashboard' });
  }
};
