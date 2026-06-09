import { PrismaClient, Role } from '../../src/generated/prisma';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  const [adminPw, userPw] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('User1234!', 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopflow.com' },
    update: {},
    create: {
      email: 'admin@shopflow.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPw,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'john_doe',
      firstName: 'John',
      lastName: 'Doe',
      password: userPw,
      role: Role.USER,
    },
  });

  console.log('  users: admin=%s user=%s', admin.email, user.email);
}
