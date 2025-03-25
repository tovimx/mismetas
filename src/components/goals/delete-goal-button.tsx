'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { deleteGoal } from '@/app/actions/goal-actions';
import { useToast } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';

interface DeleteGoalButtonProps {
  goalId: string;
  className?: string;
}

export function DeleteGoalButton({ goalId, className }: DeleteGoalButtonProps) {
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
      console.error('Failed to delete goal:', error);
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
      disabled={isDeleting}
      className={`delete-button ${className || ''}`}
    >
      <Icon name="trash" className="h-4 w-4" />
    </Button>
  );
}
