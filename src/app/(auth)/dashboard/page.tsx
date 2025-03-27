import { auth } from '@/auth';
import { db } from '@/lib/db';
import { GoalSection } from '@/components/goals/goal-section';

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
          <div className="text-3xl font-bold">{goals.length}</div>
          <p className="text-muted-foreground text-sm mt-2">Goals you're currently working on</p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Completed Goals</h2>
          <div className="text-3xl font-bold">
            {goals.filter(goal => goal.progress >= (goal.target || 100)).length}
          </div>
          <p className="text-muted-foreground text-sm mt-2">Goals you've successfully achieved</p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
          <div className="text-3xl font-bold">
            {goals.length > 0
              ? Math.round(
                  goals.reduce(
                    (acc, goal) => acc + (goal.progress / (goal.target || 100)) * 100,
                    0
                  ) / goals.length
                )
              : 0}
            %
          </div>
          <p className="text-muted-foreground text-sm mt-2">Your average completion rate</p>
        </div>
      </div>
      <GoalSection goals={goals} />
    </div>
  );
}
