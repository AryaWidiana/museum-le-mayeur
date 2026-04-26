import prisma from '../utils/prisma.js';

export const createLog = async (req, res, next) => {
  try {
    const { type, title, detail } = req.body;

    if (!type || !title || !detail) {
      return res.status(400).json({ success: false, message: 'Type, title, dan detail wajib diisi' });
    }

    const log = await prisma.activityLog.create({
      data: { type, title, detail }
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
