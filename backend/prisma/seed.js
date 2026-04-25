import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Seed Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log('✅ Admin created:', admin.username);

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Dewasa WNI', type: 'WNI', price: 10000 },
    { name: 'Anak WNI', type: 'WNI', price: 5000 },
    { name: 'Dewasa WNA', type: 'WNA', price: 50000 },
    { name: 'Anak WNA', type: 'WNA', price: 25000 },
  ];

  for (const category of categoriesData) {
    const createdCategory = await prisma.category.create({
      data: category,
    });
    console.log(`✅ Category created: ${createdCategory.name}`);
  }

  // 3. Seed Default Schedule (Opsional)
  const scheduleCount = await prisma.schedule.count();
  if (scheduleCount === 0) {
    await prisma.schedule.create({
      data: {
        openTime: '08:00',
        closeTime: '16:00'
      }
    });
    console.log('✅ Default schedule created: 08:00 - 16:00');
  }

  console.log('🎉 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
