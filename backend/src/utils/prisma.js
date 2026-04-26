import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  });
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prismaClient ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClient = prisma;
