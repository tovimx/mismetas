import Image from 'next/image';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { SignOutForm } from '@/components/auth/sign-out-form';
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

  if (!session?.user?.email) {
    return null; // Since middleware handles redirect, we can just return null
  }

  const goals = await getUserGoals(session.user.id || '');

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {session.user.image && (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0 relative">
              <Image
                src={session.user.image}
                alt={`${session.user.name || 'User'}'s profile`}
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            {session.user.email && (
              <div className="text-sm text-muted-foreground mt-1">
                Signed in as {session.user.email}
              </div>
            )}
          </div>
        </div>

        <SignOutForm variant="ghost" />
      </div>

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
