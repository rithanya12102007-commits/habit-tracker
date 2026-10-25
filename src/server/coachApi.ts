import fs from 'fs';
import path from 'path';
import { Modality } from '@google/genai';
import { generateCoachReply, getAiClient } from './geminiService';

// Shared by server.ts (production) and vite.config.ts (development)

const MAX_REQUESTS_PER_MINUTE = 15;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_ITEMS = 6;

// Read the Firebase web API key (used only to check the login token)
let firebaseApiKey = '';
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  firebaseApiKey = JSON.parse(fs.readFileSync(configPath, 'utf8')).apiKey || '';
} catch (error) {
  console.error('Could not read firebase-applet-config.json:', error);
}

// ---------- Simple rate limit: max requests per minute for each user / IP ----------
const requestTimes = new Map<string, number[]>();

function isRateLimited(key: string, maxPerMinute: number = MAX_REQUESTS_PER_MINUTE): boolean {
  const now = Date.now();
  const recent = (requestTimes.get(key) || []).filter((t) => now - t < 60_000);
  if (recent.length >= maxPerMinute) {
    requestTimes.set(key, recent);
    return true;
  }
  recent.push(now);
  requestTimes.set(key, recent);
  return false;
}

// ---------- Check the Firebase login token, returns the user id or null ----------
async function getUserIdFromToken(idToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.users?.[0]?.localId || null;
  } catch {
    return null;
  }
}

export interface CoachApiResponse {
  status: number;
  json: Record<string, unknown>;
}

export async function handleCoachRequest(
  body: any,
  authorizationHeader: string | undefined,
  clientIp: string
): Promise<CoachApiResponse> {
  // 1. Who is asking?
  const token = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.slice(7) : '';
  const userId = token ? await getUserIdFromToken(token) : null;

  if (token && !userId) {
    return { status: 401, json: { error: 'Invalid or expired login. Please sign in again.' } };
  }

  // 2. Too many requests?
  const rateKey = userId ? `user:${userId}` : `guest:${clientIp}`;
  if (isRateLimited(rateKey)) {
    return { status: 429, json: { error: 'Too many requests. Please wait a minute.' } };
  }

  // 3. Check the input
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { status: 400, json: { error: 'Message is empty or too long.' } };
  }

  const history = (Array.isArray(body?.history) ? body.history : [])
    .slice(-MAX_HISTORY_ITEMS)
    .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, MAX_MESSAGE_LENGTH) }));

  // 4. Only signed-in users use the real Gemini AI. Guests and demo users get the built-in replies.
  const result = await generateCoachReply(message, history, body?.context, userId !== null);
  return { status: 200, json: { reply: result.reply, source: result.source } };
}

// ---------- Live voice: give a signed-in user a short-lived key for the Gemini Live API ----------
const LIVE_MODEL = process.env.GEMINI_LIVE_MODEL || 'gemini-3.8-live';

export async function handleLiveTokenRequest(
  authorizationHeader: string | undefined,
  clientIp: string = 'unknown'
): Promise<CoachApiResponse> {
  const token = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.slice(7) : '';
  const userId = token ? await getUserIdFromToken(token) : null;

  const rateKey = userId ? `live:${userId}` : `live_guest:${clientIp}`;
  if (isRateLimited(rateKey, 10)) {
    return { status: 429, json: { error: 'Too many live calls. Please wait a minute.' } };
  }

  const ai = getAiClient();
  if (!ai) {
    return { status: 503, json: { error: 'AI is not set up on the server (missing GEMINI_API_KEY).' } };
  }

  try {
    const created = await ai.authTokens.create({
      config: {
        uses: 1, // one call per key
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model: LIVE_MODEL,
          config: { responseModalities: [Modality.AUDIO] },
        },
      },
    });
    return { status: 200, json: { token: created.name, model: LIVE_MODEL } };
  } catch (error) {
    console.error(`Could not create live voice token (model: ${LIVE_MODEL}):`, error);
    return { status: 500, json: { error: 'Could not start live voice. Please try again later.' } };
  }
}

