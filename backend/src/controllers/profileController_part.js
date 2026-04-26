export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.adminActivity.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan' });
    }
    next(error);
  }
};
