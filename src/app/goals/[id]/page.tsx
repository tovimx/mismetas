import { Goal } from '@prisma/client';
import { db } from '@/lib/db';

export default async function getGoalPage(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { goals: { orderBy: { updatedAt: 'desc' } } },
  });

  return user?.goals || [];

  console.log(goals);
}
