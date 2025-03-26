import { db } from '@/lib/db';
import { auth } from '@/auth';
import GoalCard from '@/components/goals/goal-card';

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { goals: { orderBy: { updatedAt: 'desc' } } },
  });

  return <GoalCard goals={user?.goals || []} />;
}
