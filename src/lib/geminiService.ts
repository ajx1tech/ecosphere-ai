import { GoogleGenerativeAI } from '@google/generative-ai';
import { CarbonProfile, FootprintBreakdown } from './types';

// Initialize the Google Generative AI client
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Module-scope variables for rate limiting
let lastCallTimestamp = 0;
const MIN_CALL_INTERVAL_MS = 800;

/**
 * Sanitizes user input by trimming whitespace and stripping HTML tags.
 * 
 * @param input The raw user input string.
 * @returns The sanitized string.
 */
function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>?/gm, '');
}

/**
 * Enforces a minimum interval between AI API calls to prevent rate limiting.
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < MIN_CALL_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_CALL_INTERVAL_MS - elapsed));
  }
  lastCallTimestamp = Date.now();
}

/**
 * Helper to determine the dominant emission category for personalized context.
 */
function getDominantCategory(breakdown: FootprintBreakdown): string {
  const { transport, diet, shopping, energy, digital } = breakdown;
  const max = Math.max(transport, diet, shopping, energy, digital);
  if (max === transport) return 'transport';
  if (max === diet) return 'diet';
  if (max === shopping) return 'shopping';
  if (max === energy) return 'energy';
  return 'digital';
}

/**
 * Interacts with the Gemini model to provide personalized sustainability coaching.
 * 
 * @param userMessage The new message from the user.
 * @param profile The user's current carbon profile.
 * @param breakdown The calculated footprint breakdown.
 * @param riskScore The user's computed risk score.
 * @param conversationHistory Previous messages in the chat session.
 * @returns A string containing the coach's personalized response.
 */
export async function askSustainabilityCoach(
  userMessage: string,
  profile: CarbonProfile,
  breakdown: FootprintBreakdown,
  riskScore: number,
  conversationHistory: ChatMessage[]
): Promise<string> {
  try {
    await enforceRateLimit();

    const sanitizedMessage = sanitizeInput(userMessage);
    const dominantCategory = getDominantCategory(breakdown);

    const systemInstruction = `You are EcoSphere AI, a personalized sustainability coach. This user's current annual footprint is ${breakdown.total}kg CO2e. Their highest-impact category is ${dominantCategory}. Their Carbon Risk Score is ${riskScore}/100. Their diet type is ${profile.dietType}, they fly ${profile.flightsPerYear} times/year, and commute via ${profile.transportMode}.

Give specific, numeric, personalized advice using THEIR actual data — never generic tips. When suggesting a change, always estimate the kg CO2 impact using realistic figures (1 vegetarian meal/week ≈ 50kg/year saved, 1 flight replaced by train ≈ 200kg saved, reducing AC by 1hr/day ≈ 80kg/year saved). Keep responses under 120 words. Be encouraging, never preachy.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(sanitizedMessage);
    
    return result.response.text();
  } catch (error) {
    console.error("Error in askSustainabilityCoach:", error);
    return "I'm having trouble analyzing your data right now — please try again shortly.";
  }
}

/**
 * Generates a natural-language weekly summary injecting deterministic habit changes.
 * 
 * @param breakdown The current footprint breakdown.
 * @param habitChanges Array of detected habit change insights from history.
 * @returns A short, personalized summary string.
 */
export async function generateWeeklySummary(
  breakdown: FootprintBreakdown,
  habitChanges: { category: string; changePercent: number; insight: string }[]
): Promise<string> {
  try {
    await enforceRateLimit();

    const insightsText = habitChanges.length > 0 
      ? habitChanges.map(h => `- ${h.insight}`).join('\n')
      : "Your habits have remained remarkably consistent this week.";

    const prompt = `You are EcoSphere AI. The user's total carbon footprint is currently ${breakdown.total}kg CO2e/year.
Here are the recent changes detected in their habits based on our data:
${insightsText}

Based on this data, write a 2-3 sentence personalized weekly summary. Be encouraging and concise. Do not use bullet points.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    
    return result.response.text().trim();
  } catch (error) {
    console.error("Error in generateWeeklySummary:", error);
    return `Your weekly footprint is currently tracking at ${breakdown.total}kg CO2e. Keep up the good work!`;
  }
}
