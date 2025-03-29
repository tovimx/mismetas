import { Goal } from '@prisma/client';

function ActiveGoals({ goals }: { goals: Goal[] }) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
      <div className="text-3xl font-bold">{goals.length}</div>
      <p className="text-muted-foreground text-sm mt-2">Goals you're currently working on</p>
    </div>
  );
}

function CompletedGoals({ goals }: { goals: Goal[] }) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Completed Goals</h2>
      <div className="text-3xl font-bold">
        {goals.filter(goal => goal.progress >= (goal.target || 100)).length}
      </div>
      <p className="text-muted-foreground text-sm mt-2">Goals you've successfully achieved</p>
    </div>
  );
}

function OverallProgress({ goals }: { goals: Goal[] }) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
      <div className="text-3xl font-bold">
        {goals.length > 0
          ? Math.round(
              goals.reduce((acc, goal) => acc + (goal.progress / (goal.target || 100)) * 100, 0) /
                goals.length
            )
          : 0}
        %
      </div>
      <p className="text-muted-foreground text-sm mt-2">Your average completion rate</p>
    </div>
  );
}

export function SummarySection({ goals }: { goals: Goal[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <ActiveGoals goals={goals} />
      <CompletedGoals goals={goals} />
      <OverallProgress goals={goals} />
    </div>
  );
}

SummarySection.ActiveGoals = ActiveGoals;
SummarySection.CompletedGoals = CompletedGoals;
SummarySection.OverallProgress = OverallProgress;
