import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, AlertCircle, Headphones } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';
import { LiveVoiceSession, LiveStatus } from '../../utils/liveVoice';
import { VoiceChatView } from './VoiceChatView';

interface Line {
  id: number;
  role: 'user' | 'ai';
  text: string;
  done: boolean;
}

const STATUS_TEXT: Record<LiveStatus, string> = {
  idle: 'Tap the green button to start talking',
  connecting: 'Connecting...',
  listening: 'Listening... just talk',
  speaking: 'Ritho AI is speaking...',
  error: 'Something went wrong',
};

export const LiveVoiceView: React.FC = () => {
  const { profile, isDemoUser } = useAuth();
  const { habits, todayCompletionRate, currentBestStreak } = useHabits();

  const [mode, setMode] = useState<'live' | 'classic'>('live');
  const [status, setStatus] = useState<LiveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const sessionRef = useRef<LiveVoiceSession | null>(null);
  const lineId = useRef(0);

  // Add a piece of text to the current line of that speaker (or start a new line)
  const addText = (role: 'user' | 'ai', text: string) => {
    setLines((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && !last.done) {
        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
      }
      lineId.current += 1;
      return [...prev, { id: lineId.current, role, text, done: false }];
    });
  };

  const startCall = async () => {
    setErrorMessage('');
    setLines([]);

    const habitList = habits.map((h) => `${h.title} (streak ${h.streak} days)`).join(', ') || 'no habits yet';
    const systemInstruction =
      `You are Ritho AI, a warm and encouraging voice habit coach, based on ideas from Atomic Habits and Tiny Habits. ` +
      `You are talking out loud, so keep every answer short (1 to 3 sentences), natural and friendly. ` +
      `Do not use lists, markdown or emojis. Ask at most one question at a time. ` +
      `The user's name is ${profile?.displayName || 'my friend'}. Their habits: ${habitList}. ` +
      `Today they completed ${todayCompletionRate}% of their habits. Best current streak: ${currentBestStreak} days.`;

    const session = new LiveVoiceSession({
      onStatus: (newStatus, message) => {
        setStatus(newStatus);
        if (newStatus === 'error') setErrorMessage(message || 'Live voice failed.');
      },
      onUserText: (text) => addText('user', text),
      onAiText: (text) => addText('ai', text),
      onTurnComplete: () => setLines((prev) => prev.map((l) => ({ ...l, done: true }))),
    });

    sessionRef.current = session;
    await session.start(systemInstruction, 'Say a short friendly hello and ask how my habits are going today.');
  };

  const endCall = () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
  };

  // Stop the call when leaving this screen
  useEffect(() => {
    return () => sessionRef.current?.stop();
  }, []);

  const switchMode = (newMode: 'live' | 'classic') => {
    endCall();
    setMode(newMode);
  };

  const inCall = status === 'connecting' || status === 'listening' || status === 'speaking';

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-16">
      {/* Mode switch */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-lg font-bold text-white">Voice Coach</h1>
        <div className="flex rounded-xl bg-[#121422] border border-neutral-800 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => switchMode('live')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'live' ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Live call
          </button>
          <button
            type="button"
            onClick={() => switchMode('classic')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              mode === 'classic' ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Classic
          </button>
        </div>
      </div>

      {mode === 'classic' ? (
        <VoiceChatView />
      ) : (
        <div className="p-6 rounded-2xl bg-[#121422] border border-neutral-800 space-y-5">
          <div className="flex flex-col items-center gap-4 py-4">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all ${
                status === 'speaking'
                  ? 'border-violet-400 bg-violet-600/30 animate-pulse'
                  : status === 'listening'
                  ? 'border-emerald-400 bg-emerald-600/20 animate-pulse'
                  : 'border-neutral-700 bg-[#181a29]'
              }`}
            >
              {inCall ? <PhoneOff className="w-9 h-9 text-white" /> : <Phone className="w-9 h-9 text-neutral-300" />}
            </div>

            <p className="text-sm text-neutral-300">{STATUS_TEXT[status]}</p>

            {inCall ? (
              <button
                type="button"
                onClick={endCall}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold"
              >
                End call
              </button>
            ) : (
              <button
                type="button"
                onClick={startCall}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
              >
                Start live call
              </button>
            )}

            <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> Use headphones so the coach does not hear itself.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {lines.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div key={line.id} className={`flex ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      line.role === 'user' ? 'bg-violet-600 text-white' : 'bg-[#181a29] text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
