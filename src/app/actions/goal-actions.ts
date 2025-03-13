"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema for goal validation
const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  targetValue: z.coerce.number().int().positive().optional(),
  duration: z.object({
    value: z.coerce.number().positive(),
    unit: z.enum(['day', 'week', 'month', 'year'])
  }).optional(),
})

export type GoalFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    progress?: string[];
    targetValue?: string[];
    duration?: string[];
    _form?: string[];
  };
  success?: boolean;
}

// Helper function to calculate target date from duration
function calculateTargetDate(value: number, unit: string): Date {
  const today = new Date();
  const targetDate = new Date(today);
  
  switch(unit) {
    case 'day':
      targetDate.setDate(today.getDate() + value);
      break;
    case 'week':
      targetDate.setDate(today.getDate() + (value * 7));
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
  const session = await auth()
  
  if (!session?.user?.id) {
    return {
      errors: {
        _form: ["You must be logged in to create a goal"]
      }
    }
  }

  // Parse duration from form data
  let duration;
  const durationValue = formData.get("durationValue");
  const durationUnit = formData.get("durationUnit");
  
  if (durationValue && durationUnit) {
    duration = {
      value: Number(durationValue),
      unit: durationUnit.toString()
    };
  }

  // Extract and validate form data
  const validationResult = createGoalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    progress: formData.get("progress"),
    targetValue: formData.get("targetValue"),
    duration: duration
  })

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors
    }
  }

  const { title, description, progress, targetValue, duration: validatedDuration } = validationResult.data

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
        targetDate,
        userId: session.user.id,
      },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error("Failed to create goal:", error)
    return {
      errors: {
        _form: ["Failed to create goal. Please try again."]
      }
    }
  }
}

export async function updateGoalProgress(goalId: string, newProgress: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Find the goal first to make sure it belongs to the user
  const goal = await db.goal.findUnique({
    where: {
      id: goalId,
    },
  })

  if (!goal) {
    throw new Error("Goal not found")
  }

  if (goal.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // Update the goal progress
  await db.goal.update({
    where: {
      id: goalId,
    },
    data: {
      progress: newProgress,
    },
  })

  // Revalidate the dashboard path to refresh the UI
  revalidatePath('/dashboard')
}

export async function deleteGoal(goalId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Find the goal first to make sure it belongs to the user
  const goal = await db.goal.findUnique({
    where: {
      id: goalId,
    },
  })

  if (!goal) {
    throw new Error("Goal not found")
  }

  if (goal.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await db.goal.delete({
    where: {
      id: goalId,
    },
  })

  revalidatePath('/dashboard')
} 