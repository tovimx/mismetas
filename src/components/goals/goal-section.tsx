'use client';

import { useState } from 'react';
import { InlineGoalCreation } from '@/components/goals/inline-goal-creation';
import { type Goal } from '@prisma/client';

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
  
  // Create components with proper open state handling
  const AddGoalButton = () => (
    <InlineGoalCreation 
      onOpenChange={handleFormOpen}
    />
  );
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Goals</h2>
        {goals.length > 0 && <AddGoalButton />}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {goals.length === 0 ? (
          <div className="border rounded-lg p-4">
            {!isCreatingGoal && (
              <p className="text-muted-foreground text-center mb-4">
                You don't have any goals yet.
              </p>
            )}
            <div className="flex justify-center">
              {isCreatingGoal ? (
                <InlineGoalCreation 
                  onOpenChange={handleFormOpen}
                  setInitiallyOpen={true}
                />
              ) : (
                <button
                  onClick={handleEmptyStateButtonClick}
                  className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                  Create goal
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {Math.min(100, Math.round(goal.progress / (goal.target || 100) * 100))}%
                  </span>
                </div>
                {goal.description && (
                  <p className="text-muted-foreground text-sm mt-2">{goal.description}</p>
                )}
                <div className="mt-4 bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${Math.min(100, Math.round(goal.progress / (goal.target || 100) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{goal.progress}</span>
                  <span>{goal.target || 100}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
} 