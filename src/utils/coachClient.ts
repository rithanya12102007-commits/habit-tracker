import { auth } from '../lib/firebase';

// Sends a message to the AI coach API. Adds the login token when the user is signed in.
export async function askCoach(body: object): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const token = await auth.currentUser?.getIdToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch('/api/coach/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    throw new Error('You are sending messages too fast. Please wait a minute and try again.');
  }
  if (!res.ok) {
    throw new Error('AI Coach service temporarily busy. Please try again.');
  }

  const data = await res.json();
  return data.reply || '';
}
