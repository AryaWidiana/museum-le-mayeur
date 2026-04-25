import prisma from '../utils/prisma.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' }
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, type, price } = req.body;
    
    if (!name || !type || price === undefined) {
      return res.status(400).json({ success: false, message: 'Nama, type, dan harga wajib diisi' });
    }

    const category = await prisma.category.create({
      data: { name, type, price: parseInt(price) }
    });

    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, price } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { 
        name: name || undefined, 
        type: type || undefined, 
        price: price !== undefined ? parseInt(price) : undefined 
      }
    });

    res.status(200).json({ success: true, message: 'Kategori berhasil diperbarui', data: category });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }
    next(error);
  }
};
