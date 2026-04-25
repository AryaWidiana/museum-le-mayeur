import prisma from '../utils/prisma.js';

export const createTransaction = async (req, res, next) => {
  try {
    // Debug logging (sementara)
    console.log(req.body);

    const { name, category, ticketType, payment } = req.body;

    // 1. Validasi input
    if (!name || !category || !ticketType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Semua field (name, category, ticketType) wajib diisi' 
      });
    }

    // 2. Mencari Category berdasarkan type (category) dan name (ticketType)
    const categoryRecord = await prisma.category.findFirst({
      where: {
        type: category,
        name: ticketType
      }
    });

    if (!categoryRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kategori tiket tidak ditemukan' 
      });
    }

    // 3. Menyimpan ke Transaction
    const transaction = await prisma.transaction.create({
      data: { 
        name, 
        totalPrice: categoryRecord.price,
        categoryId: categoryRecord.id,
        payment: payment || "Cash"
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Transaksi berhasil', 
      data: transaction 
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { category: true } // Join dengan category
    });

    const totalItems = await prisma.transaction.count({ where });
    const totalPages = Math.ceil(totalItems / take);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data transaksi',
      data: transactions,
      meta: {
        totalItems,
        totalPages,
        currentPage: parseInt(page),
        limit: take
      }
    });
  } catch (error) {
    next(error);
  }
};
