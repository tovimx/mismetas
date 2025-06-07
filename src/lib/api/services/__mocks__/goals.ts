// Mock implementation of goals service for testing

import { validateGoalInput } from '@/lib/goal-validation';

export const validateGoal = jest.fn(async (goalText: string) => {
  // Default to using client validation for consistency
  const clientValidation = validateGoalInput(goalText);
  return {
    isValid: clientValidation.isValid,
    feedback: clientValidation.message,
    confidence: 1,
  };
});

export const generateGoalPlan = jest.fn(async () => ({
  tasks: [
    { title: 'Start with 10 minutes daily practice' },
    { title: 'Set up a dedicated practice space' },
  ],
  suggestions: [
    'Focus on consistency over duration',
    'Track your progress daily',
  ],
}));

export const getTargetOptions = jest.fn(async () => ({
  options: [
    { value: 10, label: '10 minutes daily', description: 'Great for beginners' },
    { value: 30, label: '30 minutes daily', description: 'Build solid habits' },
    { value: 60, label: '1 hour daily', description: 'Accelerate your progress' },
  ],
}));