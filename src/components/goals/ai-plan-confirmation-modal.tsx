import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import DialogClose if needed
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AiPlan {
  tasks: { title: string }[];
  suggestions: string[];
}

interface AiPlanConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AiPlan | null;
  onAccept: () => void;
  isLoading: boolean; // To disable buttons during save
}

export function AiPlanConfirmationModal({
  isOpen,
  onClose,
  plan,
  onAccept,
  isLoading,
}: AiPlanConfirmationModalProps) {
  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !isLoading && !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Review AI Generated Plan</DialogTitle>
          <DialogDescription>
            The AI has generated the following tasks and suggestions based on your goal. Accept the
            plan to create your goal with these tasks, or cancel to modify your goal details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Display Tasks */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Suggested Tasks:</h3>
            {plan.tasks.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {plan.tasks.map((task, index) => (
                  <li key={index}>{task.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No specific tasks generated.</p>
            )}
          </div>

          {/* Display Suggestions */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
              General Suggestions:
            </h3>
            {plan.suggestions.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {plan.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No suggestions provided.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel / Modify
          </Button>
          <Button onClick={onAccept} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Saving...' : 'Accept & Create Goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
