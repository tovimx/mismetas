import { auth } from '@/auth';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';
import { type Goal, type Task, TaskStatus } from '@prisma/client';

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
      tasks: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return goal as GoalWithTasks | null;
}

export default async function GoalPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const goal = await getGoal(id);

  if (!goal) {
    throw new Error(`Goal with ID ${id} not found`);
  }

  const acceptedTasks = goal.tasks.filter(
    task => task.status === TaskStatus.ACCEPTED && !task.completed
  );
  const completedTasks = goal.tasks.filter(
    task => task.status === TaskStatus.ACCEPTED && task.completed
  );
  const suggestedTasks = goal.tasks.filter(task => task.status === TaskStatus.SUGGESTED);

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
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              {goal.description || 'No description provided.'}
            </p>
          </div>

          {goal.targetDate && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Target Date</h3>
              <p className="text-muted-foreground">{format(goal.targetDate, 'PPP')}</p>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold mb-4 border-t pt-6">Active Tasks</h3>
            {acceptedTasks.length > 0 ? (
              <ul className="space-y-3">
                {acceptedTasks.map(task => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <span className="text-base">{task.title}</span>
                    <Button variant="outline" size="sm">
                      Mark as Done
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No active tasks for this goal yet. Add some from the suggestions below or create new
                ones!
              </p>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Completed Tasks</h3>
              <ul className="space-y-2">
                {completedTasks.map(task => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-2 border rounded-md bg-muted/30 opacity-70"
                  >
                    <span className="line-through text-muted-foreground">{task.title}</span>
                    <Badge variant="secondary">Done</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestedTasks.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 border-t pt-6 text-muted-foreground">
                Suggested Tasks <span className="text-sm font-normal">(Unlockable)</span>
              </h3>
              <ul className="space-y-3">
                {suggestedTasks.map(task => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 border border-dashed rounded-lg bg-muted/20 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-base text-muted-foreground">{task.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary-focus"
                    >
                      <PlusCircleIcon className="h-4 w-4 mr-2" />
                      Add to Goal
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {acceptedTasks.length === 0 &&
            suggestedTasks.length === 0 &&
            completedTasks.length === 0 && (
              <p className="text-sm text-muted-foreground italic border-t pt-6">
                No tasks (active, completed, or suggested) found for this goal.
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
