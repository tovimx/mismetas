import { Goal } from '@prisma/client';

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-card md:p-6" data-component="summary-card">
      <h2 className="text-xl font-semibold mb-2 md:mb-4">{title}</h2>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-muted-foreground text-sm mt-2">{description}</p>
    </div>
  );
}

export function SummarySection({ goals }: { goals: Goal[] }) {
  const activeGoalsCount = goals.length;
  const completedGoalsCount = goals.filter(goal => goal.progress >= (goal.target || 100)).length;
  const overallProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((acc, goal) => acc + (goal.progress / (goal.target || 100)) * 100, 0) /
            goals.length
        )
      : 0;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6 mb-8" data-component="summary">
      <SummaryCard
        title="Active Goals"
        value={activeGoalsCount}
        description="Goals you're currently working on"
      />
      <SummaryCard
        title="Completed Goals"
        value={completedGoalsCount}
        description="Goals you've successfully achieved"
      />
      <SummaryCard
        title="Overall Progress"
        value={`${overallProgress}%`}
        description="Your average completion rate"
      />
    </div>
  );
}
