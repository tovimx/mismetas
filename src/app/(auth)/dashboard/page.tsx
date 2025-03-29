import { auth } from '@/auth';
import { db } from '@/lib/db';
import { GoalSection } from '@/components/goals/goal-section';
import { SummarySection } from '@/components/auth/dashboard/summary-section';

// Server-side function to fetch user goals using email as fallback
async function getUserGoals(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { goals: { orderBy: { updatedAt: 'desc' } } },
  });

  return user?.goals || [];
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const goals = await getUserGoals(session.user.id);

  return (
    <div>
      <SummarySection goals={goals} />
      <GoalSection goals={goals} />
    </div>
  );
}
