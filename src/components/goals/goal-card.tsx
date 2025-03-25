import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string | null;
    targetDate: Date | null;
    progress: number;
    status: string;
    createdAt: Date;
  };
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={() => router.push(`/dashboard/goals/${goal.id}`)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="hover:text-primary">
              <Link href={`/dashboard/goals/${goal.id}`} className="hover:underline">
                {goal.title} test
              </Link>
            </CardTitle>
            <CardDescription>Created on {format(goal.createdAt, 'PPP')}</CardDescription>
          </div>
          <Badge variant={goal.status === 'IN_PROGRESS' ? 'default' : 'success'}>
            {goal.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goal.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{goal.description}</p>
          )}
          {goal.targetDate && (
            <p className="text-sm text-gray-500">Target Date: {format(goal.targetDate, 'PPP')}</p>
          )}
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
