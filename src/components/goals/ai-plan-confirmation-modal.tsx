'use client'; // Mark as a Client Component

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming a Checkbox component exists
import { Label } from '@/components/ui/label'; // Assuming a Label component exists

// Define the Task structure, assuming titles are unique for keys
// If not, an 'id' field would be better.
interface Task {
  title: string;
  // id?: string; // Optional: if you have unique IDs for tasks
}

interface AiPlan {
  tasks: Task[];
  suggestions: string[];
}

// Data structure passed to the onAccept callback
export interface AcceptedPlanData {
  selectedTasks: Task[];
  allSuggestedTasks: Task[];
}

interface AiPlanConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AiPlan | null;
  onAccept: (data: AcceptedPlanData) => void; // Updated onAccept signature
  isLoading: boolean;
}

export function AiPlanConfirmationModal({
  isOpen,
  onClose,
  plan,
  onAccept,
  isLoading,
}: AiPlanConfirmationModalProps) {
  const [selectedTaskTitles, setSelectedTaskTitles] = useState<Set<string>>(new Set());

  // Initialize or update selected tasks when the plan changes or modal opens
  useEffect(() => {
    if (isOpen && plan && plan.tasks) {
      // Default to all tasks being selected initially
      setSelectedTaskTitles(new Set(plan.tasks.map(task => task.title)));
    } else if (!isOpen) {
      // Optional: Clear selection when modal closes if that behavior is desired
      // setSelectedTaskTitles(new Set());
    }
  }, [isOpen, plan]); // Rerun when isOpen or plan changes

  if (!plan) return null;

  const handleTaskToggle = (taskTitle: string) => {
    if (isLoading) return; // Prevent changes if a save is in progress
    setSelectedTaskTitles(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(taskTitle)) {
        newSelected.delete(taskTitle);
      } else {
        newSelected.add(taskTitle);
      }
      return newSelected;
    });
  };

  const handleAccept = () => {
    if (!plan) return; // Should not happen if button is enabled
    const selectedTasks = plan.tasks.filter(task => selectedTaskTitles.has(task.title));
    onAccept({ selectedTasks, allSuggestedTasks: plan.tasks });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => !isLoading && !open && onClose()} // Prevent closing if loading
      data-component="ai-plan-confirmation-modal"
    >
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Review AI Generated Plan</DialogTitle>
          <DialogDescription>
            Select the tasks you'd like to start with. You can add or modify tasks later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
          {' '}
          {/* Added scroll for long lists */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Suggested Tasks:</h3>
            {plan.tasks.length > 0 ? (
              <ul className="space-y-3">
                {plan.tasks.map((task, index) => (
                  // Using task.title as key, ensure titles are unique or use a proper id
                  <li
                    key={task.title /* or task.id if available */}
                    className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`task-${index}-${task.title.replace(/\s+/g, '-')}`} // More robust ID
                      checked={selectedTaskTitles.has(task.title)}
                      onCheckedChange={() => handleTaskToggle(task.title)}
                      disabled={isLoading}
                      aria-label={`Select task: ${task.title}`}
                    />
                    <Label
                      htmlFor={`task-${index}-${task.title.replace(/\s+/g, '-')}`}
                      className="text-sm cursor-pointer flex-1" // flex-1 to take available space for clicking
                    >
                      {task.title}
                    </Label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No specific tasks generated.</p>
            )}
          </div>
          {plan.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                General Suggestions:
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {plan.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel / Modify
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading || selectedTaskTitles.size === 0} // Disable if no tasks selected
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading
              ? 'Saving...'
              : `Accept & Create (${selectedTaskTitles.size}) Task${selectedTaskTitles.size === 1 ? '' : 's'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
