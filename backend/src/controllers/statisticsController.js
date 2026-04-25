import prisma from '../utils/prisma.js';

export const getStatistics = async (req, res) => {
  try {
    const allTransactions = await prisma.transaction.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });

    let totalTransaksi = allTransactions.length;
    let totalPendapatan = 0;

    const mapWNI = {};
    const mapWNA = {};
    
    const pembayaranWNI = [];
    const pembayaranWNA = [];

    allTransactions.forEach(t => {
      totalPendapatan += t.totalPrice;

      const type = t.category?.type || 'WNI';
      const catName = t.category?.name || 'Lainnya';

      if (type === 'WNI') {
        mapWNI[catName] = (mapWNI[catName] || 0) + 1;
        if (pembayaranWNI.length < 10) {
          pembayaranWNI.push({
            no: t.id,
            nama: t.name,
            tanggal: t.createdAt.toISOString().split('T')[0],
            pembayaran: t.payment || 'Cash'
          });
        }
      } else {
        mapWNA[catName] = (mapWNA[catName] || 0) + 1;
        if (pembayaranWNA.length < 10) {
          pembayaranWNA.push({
            no: t.id,
            nama: t.name,
            tanggal: t.createdAt.toISOString().split('T')[0],
            pembayaran: t.payment || 'Cash'
          });
        }
      }
    });

    const rataRataPembelian = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;

    const breakdownWNI = Object.keys(mapWNI).map(label => ({ label, value: mapWNI[label] }));
    const breakdownWNA = Object.keys(mapWNA).map(label => ({ label, value: mapWNA[label] }));

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data statistik',
      data: {
        totalTransaksi,
        totalPendapatan,
        rataRataPembelian,
        breakdownWNI,
        breakdownWNA,
        pembayaranWNI,
        pembayaranWNA
      }
    });

  } catch (error) {
    console.error('Statistics Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memuat statistik' });
  }
};
