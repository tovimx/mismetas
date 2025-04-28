import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Basic Input Validation (Add more specific checks if needed)
if (!process.env.GOOGLE_API_KEY) {
  console.error('Missing GOOGLE_API_KEY environment variable');
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Or another suitable model

interface RequestBody {
  goalName: string;
  goalDescription?: string;
}

// Define the structure for a single option
interface TargetOption {
  value: number; // The quantitative target
  label: string; // A user-friendly label (e.g., "5 kg", "10 km", "$500")
  description?: string; // Optional extra context
}

// Define the structure for the successful response
interface SuccessResponse {
  options: TargetOption[];
}

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return NextResponse.json({ error: 'Request body is missing.' }, { status: 400 });
    }
    const body = (await req.json()) as RequestBody;
    const { goalName, goalDescription } = body;

    if (!goalName) {
      return NextResponse.json({ error: 'Goal name is required.' }, { status: 400 });
    }

    // --- Construct the Prompt ---
    const prompt = `
You are an expert assistant helping users define specific, measurable goals.
Analyze the following goal provided by a user:
Name: "${goalName}"
Description: "${goalDescription || 'None provided'}"

Based *only* on the goal's name and description, suggest 3 to 5 specific, quantitative, and distinct target options for this goal. The options should represent different levels of ambition (e.g., small, medium, large).

*   For fitness or weight goals, suggest targets in common units like 'kg', 'lbs', 'km', 'miles', 'reps', 'minutes'.
*   For financial goals, use currency symbols like '$'.
*   For learning or reading goals, use units like 'books', 'chapters', 'hours'.

If the goal is genuinely too abstract or subjective to assign meaningful quantitative targets (e.g., "Be happier", "Improve relationship"), do not invent numbers; instead, respond with an empty options array.

CRITICAL: Respond ONLY with a valid JSON object adhering strictly to the following format. Do not include markdown formatting, explanations, or any text outside the JSON object itself:
{
  "options": [
    { "value": <number>, "label": "<short descriptive label, e.g., 5 kg, 10 km, $1000, 5 books>" , "description": "<optional short context>" },
    { "value": <number>, "label": "<label>" , "description": "<optional context>" },
    ...
  ]
}

Example for "Run a race":
{
  "options": [
    { "value": 5, "label": "5 km", "description": "Complete a 5k race" },
    { "value": 10, "label": "10 km", "description": "Complete a 10k race" },
    { "value": 21, "label": "21 km", "description": "Complete a half-marathon" }
  ]
}

Example for "Save money":
 {
  "options": [
    { "value": 500, "label": "$500", "description": "Save a small emergency fund" },
    { "value": 2000, "label": "$2000", "description": "Save for a vacation" },
    { "value": 10000, "label": "$10000", "description": "Save for a down payment" }
  ]
}

Example for "Lose weight":
 {
  "options": [
    { "value": 2, "label": "2 kg", "description": "Lose a small amount" },
    { "value": 5, "label": "5 kg", "description": "Noticeable weight loss" },
    { "value": 10, "label": "10 kg", "description": "Significant weight loss" }
  ]
}

 Example for "Be more mindful":
 {
   "options": []
 }
`; // End of prompt

    console.log('--- Sending Target Options Prompt to Google AI ---');
    console.log('---------------------------------------------');

    // Call Google AI API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiResponseText = response.text();

    if (!aiResponseText) {
      console.error('Google AI response text was empty for target options.', response);
      if (response.promptFeedback?.blockReason) {
        console.error('Prompt blocked:', response.promptFeedback.blockReason);
      }
      throw new Error('AI response for target options is empty or prompt was blocked.');
    }

    console.log('--- Received Google AI Target Options (raw text) ---');
    console.log(aiResponseText);
    console.log('--------------------------------------------------');

    // --- Parse the Response ---
    let parsedResponse: SuccessResponse;
    try {
      // --- Clean the response text ---
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      let cleanedText = aiResponseText;

      if (jsonMatch && jsonMatch[0]) {
        cleanedText = jsonMatch[0];
        console.log('--- Cleaned AI Response Text ---');
        console.log(cleanedText);
        console.log('--------------------------------');
      } else {
        console.warn(
          'Could not extract JSON object from AI response. Attempting parse on raw text.'
        );
      }
      // --- End cleaning ---

      // Attempt to parse the cleaned text
      parsedResponse = JSON.parse(cleanedText);

      // Basic validation of the parsed structure
      if (!parsedResponse.options || !Array.isArray(parsedResponse.options)) {
        // Log the structure issue, but still default to empty array
        console.warn("Parsed AI response missing 'options' array. Content:", cleanedText);
        // We throw here to be caught below, setting options: []
        throw new Error('Parsed AI response does not match expected structure.');
      }
    } catch (parseError) {
      console.error('Failed to parse Google AI JSON response:', parseError);
      console.error('Raw AI Response (before cleaning attempt):', aiResponseText);
      // Default to empty options on parsing failure
      parsedResponse = { options: [] };
    }

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error: unknown) {
    console.error('[Google AI Target Options API Error]', error);
    let errorMessage = 'Failed to generate target options using Google AI.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ options: [] }, { status: 200 });
    // return NextResponse.json({ error: 'An error occurred.', details: errorMessage }, { status: 500 });
  }
}
