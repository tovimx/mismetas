'use client';

import { useState } from 'react';
import { InlineGoalCreation } from '@/components/goals/inline-goal-creation';
import { type Goal } from '@prisma/client';
import { Icon } from '@/components/ui/icon';
import GoalCard from './goal-card';

type GoalSectionProps = {
  goals: Goal[];
};

export function GoalSection({ goals }: GoalSectionProps) {
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  // Handle form opening in a single function to avoid race conditions
  const handleFormOpen = (isOpen: boolean) => {
    setIsCreatingGoal(isOpen);
  };

  // Pre-emptively hide the message when the user wants to create a goal
  const handleEmptyStateButtonClick = () => {
    setIsCreatingGoal(true);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Goals</h2>
        {goals.length > 0 && !isCreatingGoal && (
          <button
            onClick={handleEmptyStateButtonClick}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-black bg-transparent hover:bg-black hover:text-white h-9 px-4 py-2"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add Goal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 border-2 border-black border rounded-lg">
        {isCreatingGoal ? (
          <div className="p-4">
            <div className="flex justify-center">
              <InlineGoalCreation onOpenChange={handleFormOpen} />
            </div>
          </div>
        ) : goals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have any goals yet.</p>
            <button
              onClick={handleEmptyStateButtonClick}
              className="create-goal cursor-pointer inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-black bg-transparent hover:bg-black hover:text-white h-9 px-4 py-2"
            >
              <Icon name="plus" className="h-4 w-4" />
              Create your first goal
            </button>
          </div>
        ) : (
          goals.map(goal => <GoalCard key={goal.id} goal={goal} />)
        )}
      </div>
    </div>
  );
}
