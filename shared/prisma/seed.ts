import { PrismaClient } from '../src/generated/prisma';
import { seedUsers } from './seeders/users.seeder';
import { seedProducts } from './seeders/products.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');
  await seedUsers(prisma);
  await seedProducts(prisma);
  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
