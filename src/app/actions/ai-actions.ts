'use server';

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ValidationResult,
  GoalPlanResponse,
  TargetOptionsResponse,
  ApiError,
} from '@/lib/api/types';

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

/**
 * Server action to validate a goal using AI
 */
export async function validateGoalAction(goalText: string): Promise<ValidationResult> {
  try {
    if (!goalText || typeof goalText !== 'string') {
      throw new Error('Goal text is required');
    }

    const prompt = `Analyze if this text represents a valid personal goal: "${goalText}"
    
A valid goal should:
- Be actionable and specific
- Represent something achievable by an individual
- Not be nonsense, spam, or malicious content
- Have clear intent and purpose

Respond with JSON only, no other text:
{
  "isValid": boolean,
  "confidence": number (0-1),
  "feedback": "SHORT message if invalid (max 10 words)",
  "improvedGoal": "suggested improvement if the goal could be clearer (optional)"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract JSON from Claude's response
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Goal validation error:', error);
    throw new ApiError(
      'Failed to validate goal',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Server action to generate a goal plan with AI-suggested tasks
 */
export async function generateGoalPlanAction(
  goalName: string,
  goalDescription: string,
  goalTarget: number,
  targetDate?: string
): Promise<GoalPlanResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const durationContext = targetDate
      ? `The user wants to achieve this goal by ${new Date(targetDate).toLocaleDateString()}.`
      : 'This is a habit-based goal with no specific end date.';

    const prompt = `You are an expert in habit formation and goal achievement, specializing in the principles from "Atomic Habits" by James Clear.

Create a practical, habit-focused plan for this goal:
- Goal: ${goalName}
- Description: ${goalDescription || 'No additional description provided'}
- Target: ${goalTarget} (this could be minutes per day, repetitions, or other units depending on the goal)
- ${durationContext}

Generate a plan following these principles:
1. Make it obvious (environmental design)
2. Make it attractive (temptation bundling)
3. Make it easy (2-minute rule, reduce friction)
4. Make it satisfying (immediate rewards)

Provide your response in JSON format:
{
  "tasks": [
    { "title": "Specific, actionable task based on Atomic Habits principles" }
  ],
  "suggestions": [
    "Helpful tip or strategy for success"
  ]
}

- Generate 4-6 specific tasks that build habits
- Include 2-3 practical suggestions
- Focus on small, consistent actions rather than big goals
- Tasks should be concrete and immediately actionable`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const planData = JSON.parse(jsonMatch[0]);
    
    // Ensure the response has the expected structure
    if (!planData.tasks || !Array.isArray(planData.tasks)) {
      throw new Error('Invalid plan structure: missing tasks array');
    }
    
    return {
      tasks: planData.tasks,
      suggestions: planData.suggestions || []
    };
  } catch (error) {
    console.error('Goal plan generation error:', error);
    throw new ApiError(
      'Failed to generate goal plan',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Server action to get AI-suggested target options for a goal
 */
export async function getTargetOptionsAction(
  goalName: string,
  goalDescription?: string
): Promise<TargetOptionsResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Based on the goal "${goalName}"${
      goalDescription ? ` with description: "${goalDescription}"` : ''
    }, suggest 3 specific, measurable target options.

These should be progressive levels (beginner, intermediate, advanced) that are:
- Specific and measurable
- Realistic and achievable
- Time-bound when appropriate
- Relevant to the goal

Respond in JSON format:
{
  "options": [
    {
      "value": <number>,
      "label": "<short label>",
      "description": "<brief description of what this target means>"
    }
  ]
}

The value should be a number representing the target (minutes, repetitions, etc.)
Order from easiest to most challenging.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    
    if (!data.options || !Array.isArray(data.options)) {
      throw new Error('Invalid response structure: missing options array');
    }
    
    return { options: data.options };
  } catch (error) {
    console.error('Target options error:', error);
    // Return empty options to allow user to proceed
    return { options: [] };
  }
}