'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema for goal validation
const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  targetValue: z.coerce.number().int().positive().optional(),
  // Make duration unit optional to handle special cases
  duration: z
    .object({
      value: z.coerce.number().int().min(0), // Allow zero
      unit: z.string(), // Accept any string to handle special units like 'end-of-year'
    })
    .optional(),
});

// Define Zod schema for validation
const TaskSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty.'),
});

// Updated schema for goal creation to include all suggestions and selected ones
const GoalWithTasksAndSelectionSchema = z.object({
  title: z.string().min(3, { message: 'Goal title must be at least 3 characters.' }),
  description: z.string().optional(),
  target: z.number().int().positive().optional().default(100),
  targetDate: z.date().optional().nullable(),
  allSuggestedTasks: z.array(TaskSchema).min(1, 'At least one task suggestion is required.'),
  selectedTaskTitles: z.array(z.string()).min(1, 'At least one task must be selected.'), // Array of titles of selected tasks
});

export type GoalFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    progress?: string[];
    target?: string[];
    duration?: string[];
    _form?: string[];
    allSuggestedTasks?: string[];
    selectedTaskTitles?: string[];
  };
  success?: boolean;
};

// Helper function to calculate target date from duration
function calculateTargetDate(value: number, unit: string): Date {
  const today = new Date();
  const targetDate = new Date(today);

  // Special case: value 0 means "today" (end of day)
  if (value === 0) {
    targetDate.setHours(23, 59, 59, 999); // End of today
    return targetDate;
  }

  switch (unit) {
    case 'day':
      targetDate.setDate(today.getDate() + value);
      break;
    case 'week':
      targetDate.setDate(today.getDate() + value * 7);
      break;
    case 'month':
      targetDate.setMonth(today.getMonth() + value);
      break;
    case 'year':
      targetDate.setFullYear(today.getFullYear() + value);
      break;
  }

  return targetDate;
}

export async function createGoal(
  prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      errors: {
        _form: ['You must be logged in to create a goal'],
      },
    };
  }

  // Parse duration from form data
  let duration;
  const durationValue = formData.get('durationValue');
  const durationUnit = formData.get('durationUnit');

  if (durationValue !== null && durationUnit) {
    duration = {
      value: Number(durationValue),
      unit: durationUnit.toString(),
    };
  }

  // Extract and validate form data
  const validationResult = createGoalSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    progress: formData.get('progress'),
    targetValue: formData.get('targetValue'),
    duration: duration,
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    description,
    progress,
    targetValue,
    duration: validatedDuration,
  } = validationResult.data;

  try {
    // Calculate target date if duration is provided
    const targetDate = validatedDuration
      ? calculateTargetDate(validatedDuration.value, validatedDuration.unit)
      : null;

    await db.goal.create({
      data: {
        title,
        description: description || '',
        target: targetValue || 100,
        progress: progress || 0,
        userId: session.user.id,
        targetDate: validatedDuration?.unit === 'habit' ? null : targetDate,
        isHabit: validatedDuration?.unit === 'habit' ? true : false,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to create goal:', error);
    return {
      errors: {
        _form: ['Failed to create goal. Please try again.'],
      },
    };
  }
}

export async function updateGoalProgress(goalId: string, newProgress: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Find the goal first to make sure it belongs to the user
  const goal = await db.goal.findUnique({
    where: {
      id: goalId,
    },
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  if (goal.userId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  // Update the goal progress
  await db.goal.update({
    where: {
      id: goalId,
    },
    data: {
      progress: newProgress,
    },
  });

  // Revalidate the dashboard path to refresh the UI
  revalidatePath('/dashboard');
}

export async function deleteGoal(goalId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'You must be logged in to delete a goal',
      };
    }

    // Find the goal first to make sure it belongs to the user
    const goal = await db.goal.findUnique({
      where: {
        id: goalId,
      },
    });

    if (!goal) {
      return {
        success: false,
        error: 'Goal not found',
      };
    }

    if (goal.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to delete this goal",
      };
    }

    // Delete the goal
    await db.goal.delete({
      where: {
        id: goalId,
      },
    });

    // Revalidate the dashboard path to refresh the UI
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to delete goal:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the goal',
    };
  }
}

export async function createGoalWithTasks(
  payload: z.infer<typeof GoalWithTasksAndSelectionSchema> // Use the new schema
): Promise<GoalFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { _form: ['User not authenticated'] } };
  }

  const validationResult = GoalWithTasksAndSelectionSchema.safeParse(payload);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  // Destructure allSuggestedTasks and selectedTaskTitles along with goalData
  const { allSuggestedTasks, selectedTaskTitles, ...goalData } = validationResult.data;

  try {
    await db.goal.create({
      data: {
        ...goalData,
        userId: session.user.id,
        status: 'IN_PROGRESS',
        progress: 0,
        tasks: {
          createMany: {
            data: allSuggestedTasks.map(task => ({
              title: task.title,
              completed: false,
              // Set status based on whether the task title is in selectedTaskTitles
              status: selectedTaskTitles.includes(task.title) ? 'ACCEPTED' : 'SUGGESTED',
            })),
          },
        },
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/goals'); // Also revalidate the general goals path
    return { success: true };
  } catch (error) {
    console.error('Database error creating goal with tasks:', error);
    if (error instanceof Error) {
      // You could check for specific Prisma errors here if needed
      return { errors: { _form: [error.message] } };
    }
    return { errors: { _form: ['Database error: Failed to create goal.'] } };
  }
}
