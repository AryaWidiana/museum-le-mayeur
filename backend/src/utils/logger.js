import prisma from './prisma.js';

/**
 * Helper untuk mencatat aktivitas admin ke tabel AuditLog.
 * @param {string} action - CREATE, UPDATE, DELETE, EXPORT
 * @param {string} description - Deskripsi aktivitas
 */
export const logAdminAction = async (action, description) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        description,
      },
    });
  } catch (error) {
    console.error('Error saat mencatat Audit Log:', error);
  }
};
