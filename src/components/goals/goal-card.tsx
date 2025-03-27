import { type Goal } from '@prisma/client';
import { DeleteGoalButton } from './delete-goal-button';
import Link from 'next/link';

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  return (
    <Link
      key={goal.id}
      className="block border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      href={`/goals/${goal.id}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold hover:text-primary">{goal.title}</h3>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {Math.min(100, Math.round((goal.progress / (goal.target || 100)) * 100))}%
          </span>
          <div onClick={e => e.preventDefault()}>
            <DeleteGoalButton goalId={goal.id} className="delete-button" />
          </div>
        </div>
      </div>
      {goal.description && <p className="text-muted-foreground text-sm mt-2">{goal.description}</p>}
      <div className="mt-4 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-500 ease-in-out"
          style={{
            width: `${Math.min(100, Math.round((goal.progress / (goal.target || 100)) * 100))}%`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{goal.progress}</span>
        <span>{goal.target || 100}</span>
      </div>
    </Link>
  );
}
