import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { goalText } = await request.json();

    if (!goalText || typeof goalText !== 'string') {
      return NextResponse.json(
        { error: 'Goal text is required' },
        { status: 400 }
      );
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
  "feedback": "helpful message if invalid",
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
    
    const validationResult = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Goal validation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate goal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}