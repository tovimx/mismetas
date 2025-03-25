import { auth } from '@/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Goal, type Task } from '@prisma/client';

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

export default async function GoalPage({ params }: { params: { id: string } }) {
  const goal = await getGoal(params.id);

  if (!goal) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
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

            <div>
              <h3 className="text-lg font-semibold mb-2">Tasks</h3>
              {goal.tasks.length > 0 ? (
                <ul className="space-y-2">
                  {goal.tasks.map(task => (
                    <li key={task.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="h-4 w-4"
                      />
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No tasks added yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
