// Goal-related API service functions

import {
  ValidationResult,
  GoalPlanRequest,
  GoalPlanResponse,
  TargetOptionsRequest,
  TargetOptionsResponse,
  ApiError,
} from '../types';
import { validateGoalInput } from '@/lib/goal-validation';
import { 
  validateGoalAction, 
  generateGoalPlanAction, 
  getTargetOptionsAction 
} from '@/app/actions/ai-actions';

/**
 * Validates a goal using AI
 * Falls back to client-side validation if AI fails
 */
export async function validateGoal(goalText: string): Promise<ValidationResult> {
  try {
    return await validateGoalAction(goalText);
  } catch (error) {
    // Fall back to client-side validation
    console.warn('AI validation failed, using client validation:', error);
    const clientValidation = validateGoalInput(goalText);
    
    return {
      isValid: clientValidation.isValid,
      feedback: clientValidation.message,
      confidence: 1, // Client validation is deterministic
    };
  }
}

/**
 * Generates a goal plan with AI-suggested tasks
 */
export async function generateGoalPlan(request: GoalPlanRequest): Promise<GoalPlanResponse> {
  try {
    return await generateGoalPlanAction(
      request.goalName,
      request.goalDescription || '',
      request.goalTarget,
      request.targetDate
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Could not generate plan. Please try again.');
  }
}

/**
 * Gets AI-suggested target options for a goal
 */
export async function getTargetOptions(request: TargetOptionsRequest): Promise<TargetOptionsResponse> {
  try {
    return await getTargetOptionsAction(
      request.goalName,
      request.goalDescription
    );
  } catch (error) {
    // Return empty options on error to allow user to proceed
    console.error('Failed to get target options:', error);
    return { options: [] };
  }
}

// Re-export types that components might need
export type { ValidationResult, GoalPlanResponse, TargetOption } from '../types';