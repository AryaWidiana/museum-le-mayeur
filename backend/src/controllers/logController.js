import prisma from '../utils/prisma.js';

export const getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const logs = await prisma.auditLog.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const totalItems = await prisma.auditLog.count();
    const totalPages = Math.ceil(totalItems / take);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil audit log',
      data: logs,
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
