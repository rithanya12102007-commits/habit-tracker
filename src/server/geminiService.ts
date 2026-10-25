import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface CoachContext {
  userName?: string;
  habitsSummary?: string;
  completionRate?: string;
  currentStreaks?: string;
  recentLogs?: string;
}

const SYSTEM_INSTRUCTION = `You are Ritho AI, an intelligent, empathetic, and scientifically grounded Habit Coach for the Ritho AI platform.
Your expertise is built on behavioral psychology principles from Atomic Habits (James Clear), Tiny Habits (BJ Fogg), and cognitive science.

Your Core Guidelines:
1. Be encouraging, realistic, and solution-oriented. Never scold or be overly rigid.
2. When the user asks for routines or habits, provide bite-sized, actionable steps (e.g. 2-minute rule, habit stacking: "After I [current habit], I will [new habit]").
3. Analyze the user's actual habits and completion data provided in the context.
4. Keep answers focused, structured with markdown bullet points, bold key insights, and concise (2-4 brief paragraphs or short lists).
5. For voice chat interactions, deliver natural, spoken-friendly responses that sound warm and engaging.`;

export interface CoachResult {
  reply: string;
  source: 'ai' | 'fallback';
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// allowAi = false means: do not call Gemini, only use the built-in replies (used for guests / demo users)
export async function generateCoachReply(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  context?: CoachContext,
  allowAi: boolean = true
): Promise<CoachResult> {
  const fallback: CoachResult = { reply: generateSmartFallback(userMessage, context), source: 'fallback' };

  const ai = allowAi ? getAiClient() : null;
  if (!ai) {
    return fallback;
  }

  try {
    let contextPrompt = '';
    if (context) {
      contextPrompt = `\n[User Context]:
- Name: ${context.userName || 'Champion'}
- Active Habits: ${context.habitsSummary || 'Starting out'}
- Completion Rate: ${context.completionRate || 'N/A'}
- Streaks: ${context.currentStreaks || 'None yet'}
- Recent Progress: ${context.recentLogs || 'Tracking today'}
\n`;
    }

    const conversationPrompt = history
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'User' : 'Ritho AI'}: ${m.content}`)
      .join('\n');

    const prompt = `${contextPrompt}${conversationPrompt ? conversationPrompt + '\n' : ''}User: ${userMessage}\nRitho AI:`;

    const apiCallPromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 7000ms')), 7000)
    );

    const response = (await Promise.race([apiCallPromise, timeoutPromise])) as any;

    const reply = response.text?.trim();
    if (!reply) {
      console.error('Gemini returned an empty reply. Using built-in reply.');
      return fallback;
    }
    return { reply, source: 'ai' };
  } catch (error) {
    // Logged as an error so a wrong model name or API key problem is easy to notice
    console.error(`Gemini call failed (model: ${GEMINI_MODEL}). Using built-in reply.`, error);
    return fallback;
  }
}

// Old function name kept so nothing else breaks
export async function generateCoachResponse(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  context?: CoachContext
): Promise<string> {
  const result = await generateCoachReply(userMessage, history, context);
  return result.reply;
}


function generateSmartFallback(userMessage: string, context?: CoachContext): string {
  const lower = userMessage.toLowerCase();
  const name = context?.userName || 'Friend';

  if (lower.includes('routine') || lower.includes('create my routine')) {
    return `### 🌟 Your Optimal Daily Routine Blueprint for ${name}\n\n` +
      `Building a lasting routine works best when anchored to natural energy peaks:\n\n` +
      `* **Morning Anchor (Ignition)**: 5-minute hydration & stretch, then tackle your 1 highest-leverage habit before opening social feeds.\n` +
      `* **Midday Flow (Momentum)**: 25-minute deep focus block + quick mental reset.\n` +
      `* **Evening Wind-down (Recovery)**: Review today's habit checkmarks on Ritho AI, celebrate small wins, and prep tomorrow's cue.\n\n` +
      `**Pro-Tip**: Use Habit Stacking: *"After I pour my morning coffee, I will complete my top habit for 5 minutes."*`;
  }

  if (lower.includes('consistency') || lower.includes('improve my consistency')) {
    return `### ⚡ Boosting Your Consistency (${context?.completionRate || 'Active Journey'})\n\n` +
      `Consistency isn't about willpower—it is about lowering friction:\n\n` +
      `1. **The 2-Minute Rule**: Scale your habit down until it feels impossible to skip. Even on low-energy days, doing 2 minutes preserves the neural pathway.\n` +
      `2. **Never Miss Twice**: If life interrupts you today, protect tomorrow at all costs. Streaks bend, but they don't break.\n` +
      `3. **Visual Proof**: Every checkmark logged here on Ritho AI triggers dopamine reinforcement. Keep tracking!`;
  }

  if (lower.includes('analyze') || lower.includes('week') || lower.includes('analyze my week')) {
    return `### 📊 Weekly Performance Analysis\n\n` +
      `Based on your active records (${context?.habitsSummary || 'tracked habits'}):\n\n` +
      `* **Strength**: You are establishing awareness and regularly checking in with Ritho AI.\n` +
      `* **Observation**: High consistency usually correlates with morning completion times when decision fatigue is lowest.\n` +
      `* **Next Step**: Choose your most challenging habit and schedule it at a fixed time for the next 3 days.`;
  }

  if (lower.includes('study') || lower.includes('study plan')) {
    return `### 📚 Focused Study & Deep Work Plan\n\n` +
      `* **Phase 1 (Setup)**: Clear physical & digital clutter. Set a strict 45-minute timer.\n` +
      `* **Phase 2 (Active Recall)**: Test yourself on concepts rather than passive reading.\n` +
      `* **Phase 3 (Habit Log)**: Log your session on Ritho AI right after your timer rings to lock in the completion streak!`;
  }

  return `Great question! When cultivating strong habits, focus on making the cue obvious and the reward immediate. With your current tracking on Ritho AI, you're building identity-based momentum. What specific challenge or time of day would you like to optimize next?`;
}
