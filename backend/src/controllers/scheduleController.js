import prisma from '../utils/prisma.js';

export const getSchedule = async (req, res, next) => {
  try {
    // Kita asumsikan hanya ada 1 jadwal operasional (record pertama)
    const schedule = await prisma.schedule.findFirst();
    
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Jadwal belum diatur' });
    }

    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { openTime, closeTime } = req.body;

    if (!openTime || !closeTime) {
      return res.status(400).json({ success: false, message: 'openTime dan closeTime wajib diisi' });
    }

    // Ambil record pertama
    const schedule = await prisma.schedule.findFirst();

    let updatedSchedule;
    if (schedule) {
      updatedSchedule = await prisma.schedule.update({
        where: { id: schedule.id },
        data: { openTime, closeTime }
      });
    } else {
      updatedSchedule = await prisma.schedule.create({
        data: { openTime, closeTime }
      });
    }

    res.status(200).json({ success: true, message: 'Jadwal berhasil diperbarui', data: updatedSchedule });
  } catch (error) {
    next(error);
  }
};
