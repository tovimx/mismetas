import { auth } from '@/auth';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Goal, type Task } from '@prisma/client';
import { Metadata } from 'next';

type GoalWithTasks = Goal & {
  tasks: Task[];
};

async function getGoal(goalId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const goal = await db.goal.findUnique({
    where: {
      id: goalId,
      userId: session.user.id,
    },
    include: {
      tasks: true,
    },
  });

  return goal as GoalWithTasks | null;
}

export default async function GoalPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const goal = await getGoal(id);

  if (!goal) {
    throw new Error(`Goal with ID ${id} not found`);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{goal.title}</CardTitle>
            <CardDescription>Created on {format(goal.createdAt, 'PPP')}</CardDescription>
          </div>
          <Badge variant={goal.status === 'IN_PROGRESS' ? 'default' : 'success'}>
            {goal.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{goal.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Target Date</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {goal.targetDate ? format(goal.targetDate, 'PPP') : 'No target date set'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
