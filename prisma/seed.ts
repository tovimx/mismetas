import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: await bcrypt.hash('password123', 10),
      goals: {
        create: [
          {
            title: 'Learn Next.js',
            description: 'Complete a Next.js course and build a project',
            target: 100,
            progress: 40,
          },
          {
            title: 'Exercise regularly',
            description: 'Exercise at least 3 times per week',
            target: 100,
            progress: 60,
          },
          {
            title: 'Read more books',
            description: 'Read at least 12 books this year',
            target: 12,
            progress: 3,
          },
        ],
      },
    },
  });

  console.log(`Demo user created: ${demoUser.name} (${demoUser.email})`);

  // Add more seed data as needed
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
