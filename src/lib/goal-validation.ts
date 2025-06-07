import { GOAL_ACTION_VERBS_LOWERCASE } from './goal-verbs';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateGoalInput(input: string): ValidationResult {
  const trimmed = input.trim();
  
  // Check minimum length
  if (trimmed.length < 10) {
    return { isValid: false, message: "📝 Too short! Add more detail" };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /^[^a-zA-Z]*$/,           // No letters at all
    /^[\d\s\W]+$/,            // Only numbers and special chars
    /<script|javascript:|eval\(|function\(/i,  // Script injection attempts
    /^(test|asdf|qwerty|123|xxx)/i,  // Common test inputs
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
    return { isValid: false, message: "🤔 Please enter a real goal" };
  }
  
  // Check for goal-like keywords (positive validation)
  const lowerInput = trimmed.toLowerCase();
  const hasGoalVerb = GOAL_ACTION_VERBS_LOWERCASE.some(verb => {
    // Check if the verb appears as a whole word (not part of another word)
    const regex = new RegExp(`\\b${verb}\\b`);
    return regex.test(lowerInput);
  });
  
  if (!hasGoalVerb) {
    return { isValid: false, message: "💡 Try: Learn, Build, Run, or Create" };
  }
  
  return { isValid: true };
}