import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Ensure Google API key is set
if (!process.env.GOOGLE_API_KEY) {
  console.error('Missing GOOGLE_API_KEY environment variable');
  // Optionally throw an error or handle appropriately
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Choose a Gemini model
// gemini-1.5-flash is fast and capable
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Define the expected structure for the request body
interface RequestBody {
  goalName: string;
  goalDescription?: string;
  targetDate?: string;
  goalTarget?: number;
}

// Define the structure for the successful response
interface SuccessResponse {
  tasks: { title: string }[];
  suggestions: string[];
}

// IMPORTANT: Add runtime edge or nodejs selection if needed for Vercel
// export const runtime = 'edge'; // or 'nodejs' (default)

// Safety settings to potentially reduce refusals for planning prompts
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return NextResponse.json({ error: 'Request body is missing.' }, { status: 400 });
    }
    const body = (await req.json()) as RequestBody;
    const { goalName, goalDescription, targetDate, goalTarget } = body;

    if (!goalName) {
      return NextResponse.json({ error: 'Goal name is required.' }, { status: 400 });
    }

    // Prompt for Gemini, emphasizing JSON-only output
    const prompt = `
You are a helpful assistant expert in goal setting, planning, and habit formation, inspired by concepts from books like "Atomic Habits".
A user wants to achieve the following goal:
Name: "${goalName}"
Description: "${goalDescription || 'None provided'}"
Target: "${goalTarget || 100}"
Target Date: "${targetDate || 'Not specified'}"

Instead of just listing large milestones, break this goal down into 3-5 actionable tasks that focus on building **systems and habits** to achieve the goal. Tasks should be small, specific, and easy to integrate into a routine. Think about implementation intentions (when, where, how).

Also, provide 2-3 general suggestions or strategies based on habit formation principles (e.g., environment design, identity shift, making habits obvious/attractive/easy/satisfying) that the user could employ to successfully achieve the overall goal.

CRITICAL: Respond ONLY with a valid JSON object adhering strictly to the following format, with no explanations or conversational text before or after the JSON:
{
  "tasks": [
    { "title": "Example: Identify a specific time and place to [perform small action related to goal] daily/weekly." },
    { "title": "Example: Prepare [environment/tools] the night before to make [habit] easier." },
    { "title": "Example: Track [small consistent action] using a habit tracker." }
  ],
  "suggestions": [
    "Example: Make your cue obvious - place your running shoes by the door.",
    "Example: Start with a 'two-minute rule' version of the desired habit.",
    "Example: Pair the habit with something you enjoy (temptation bundling)."
  ]
}
`; // End of template literal

    console.log('--- Sending Prompt to Google AI ---');
    console.log(prompt.substring(0, 300) + '...'); // Log truncated prompt
    console.log('-----------------------------------');

    // Call Google AI API
    const result = await model.generateContent(
      prompt
      // Pass safety settings if needed
      // { safetySettings } \
    );
    const response = result.response;
    const aiResponseText = response.text();

    if (!aiResponseText) {
      console.error('Google AI response text was empty.', response);
      // Log potential block reason if available
      if (response.promptFeedback?.blockReason) {
        console.error('Prompt blocked:', response.promptFeedback.blockReason);
        console.error('Block details:', response.promptFeedback.blockReasonMessage);
      }
      throw new Error('AI response content is empty or prompt was blocked.');
    }

    console.log('--- Received Google AI Response (raw text) ---');
    console.log(aiResponseText);
    console.log('--------------------------------------------');

    // --- Clean and Parse the Response ---
    // Attempt to extract JSON object from potential markdown fences or other text
    let cleanedJsonText = aiResponseText;
    const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/); // Match content within {} (includes newlines)
    if (jsonMatch && jsonMatch[0]) {
      cleanedJsonText = jsonMatch[0];
      console.log('--- Cleaned JSON Text ---');
      console.log(cleanedJsonText);
      console.log('-------------------------');
    } else {
      console.warn(
        'Could not extract JSON object from AI response using regex. Attempting to parse raw response.'
      );
    }

    let parsedResponse: SuccessResponse;
    try {
      parsedResponse = JSON.parse(cleanedJsonText); // Parse the cleaned text
      // Basic validation of the parsed structure
      if (
        !parsedResponse.tasks ||
        !parsedResponse.suggestions ||
        !Array.isArray(parsedResponse.tasks) ||
        !Array.isArray(parsedResponse.suggestions)
      ) {
        throw new Error('Parsed AI response does not match expected structure.');
      }
    } catch (parseError) {
      console.error('Failed to parse Google AI JSON response:', parseError);
      console.error('Raw AI Response was:', aiResponseText); // Log the original raw response on error
      console.error('Cleaned Text Attempted:', cleanedJsonText); // Log the cleaned text attempt on error
      throw new Error('Failed to parse AI response or invalid structure.');
    }

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error: unknown) {
    console.error('[Google AI Goal Plan API Error]', error);

    let errorMessage = 'Failed to generate goal plan using Google AI.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: 'An error occurred while generating the goal plan.', details: errorMessage },
      { status: 500 }
    );
  }
}
