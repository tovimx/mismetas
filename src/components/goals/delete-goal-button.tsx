'use client';

import { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteGoal } from '@/app/actions/goal-actions';
import { useToast } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';

interface DeleteGoalButtonProps {
  goalId: string;
}

export function DeleteGoalButton({ goalId }: DeleteGoalButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteGoal(goalId);

      if (result.success) {
        addToast({
          title: 'Goal deleted',
          description: 'Your goal has been successfully deleted.',
          variant: 'success',
        });

        // Refresh the page to update the goals list
        router.refresh();
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to delete goal.',
          variant: 'error',
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'error',
      });
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">Delete?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-7 px-2"
        >
          {isDeleting ? '...' : 'Yes'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="h-7 px-2"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setShowConfirm(true)}
      aria-label="Delete goal"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
    >
      <TrashIcon className="h-4 w-4" />
    </Button>
  );
}
