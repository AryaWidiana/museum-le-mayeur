import prisma from '../utils/prisma.js';

export const getSchedule = async (req, res, next) => {
  try {
    const schedule = await prisma.schedule.findFirst();
    
    // Get upcoming holidays/closures (Libur/Tutup)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingActivities = await prisma.adminActivity.findMany({
      where: {
        date: {
          gte: today
        },
        status: {
          in: ['Libur', 'Tutup']
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.status(200).json({ 
      success: true, 
      data: {
        schedule: schedule || null,
        activities: upcomingActivities
      } 
    });
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
