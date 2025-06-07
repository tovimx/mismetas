// API Types for Goal Validation and AI Services

export interface ValidationResult {
  isValid: boolean;
  confidence?: number;
  feedback?: string;
  improvedGoal?: string;
}

export interface ValidationError {
  error: string;
  details?: string;
}

export type ValidationResponse = ValidationResult | ValidationError;

// Type guard to check if response is an error
export function isValidationError(response: ValidationResponse): response is ValidationError {
  return 'error' in response;
}

// Goal AI Types
export interface GoalPlanRequest {
  goalName: string;
  goalDescription?: string;
  goalTarget: number;
  targetDate?: string;
}

export interface GoalPlanTask {
  title: string;
}

export interface GoalPlanResponse {
  tasks: GoalPlanTask[];
  suggestions: string[];
}

export interface TargetOption {
  value: number;
  label: string;
  description?: string;
}

export interface TargetOptionsRequest {
  goalName: string;
  goalDescription?: string;
}

export interface TargetOptionsResponse {
  options: TargetOption[];
}

// Base API Response type for consistency
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

// API Error class for consistent error handling
export class ApiError extends Error {
  public details?: string;
  public status?: number;

  constructor(message: string, details?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
    this.status = status;
  }
}