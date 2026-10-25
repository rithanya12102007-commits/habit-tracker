import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  AlertCircle,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';
import { ChatMessage } from '../../types';
import { askCoach } from '../../utils/coachClient';

interface AICoachViewProps {
  initialPrompt?: string;
}

const SUGGESTED_PROMPTS = [
  { label: 'Create My Routine', icon: '⚡' },
  { label: 'Improve My Consistency', icon: '🎯' },
  { label: 'Analyze My Week', icon: '📊' },
  { label: 'Suggest New Habits', icon: '🌱' },
  { label: 'Build a Study Plan', icon: '📚' },
];

export const AICoachView: React.FC<AICoachViewProps> = ({ initialPrompt }) => {
  const { user, profile } = useAuth();
  const { habits, todayCompletionRate, currentBestStreak, recentLogsSummary } = useHabits();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        userId: user?.uid || '',
        role: 'assistant',
        content: `Hello ${profile?.displayName || 'there'}! I am your Ritho AI Habit Coach.\n\nI can help you build atomic daily routines, break through consistency plateaus, and analyze your habits. What would you like to achieve today?`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle initial prompt passed from dashboard if any
  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      userId: user?.uid || '',
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setLoading(true);

    try {
      // Gather context about user habits
      const context = {
        userName: profile?.displayName || 'Champion',
        habitsSummary: habits.map((h) => `${h.title} (${h.category})`).join(', ') || 'No habits added yet',
        completionRate: `${todayCompletionRate}% today`,
        currentStreaks: `${currentBestStreak} days max streak`,
        recentLogs: recentLogsSummary || 'Started tracking',
      };

      const reply = await askCoach({
        message: text.trim(),
        history: nextMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        context,
      });
      const aiReply = reply || 'Here is an actionable step to maintain your momentum: Start with just 2 minutes today!';

      const aiMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        userId: user?.uid || '',
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to generate response. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        userId: user?.uid || '',
        role: 'assistant',
        content: `Chat cleared! How can I assist your habit goals next, ${profile?.displayName || 'Friend'}?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Helper to format basic markdown-style text (bold, lists)
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Header ###
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-violet-300 mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Bullet * or -
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const itemText = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-neutral-200 my-0.5">
            {renderBoldText(itemText)}
          </li>
        );
      }
      // Numbered 1.
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-neutral-200 my-0.5">
            {renderBoldText(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-1">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      {/* Top Coach Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 border border-violet-400/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Ritho AI Habit Coach</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-semibold border border-violet-500/30">
                Gemini 3.8 Flash
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Personalized guidance grounded in behavioral science
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Clear conversation"
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-xl transition-colors text-xs flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Suggested Prompts Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none shrink-0">
        <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap mr-1">
          <Sparkles className="w-3 h-3 text-violet-400" /> Prompts:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(prompt.label)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#141726] hover:bg-violet-950/70 border border-neutral-800 hover:border-violet-500/40 text-xs text-neutral-200 transition-all whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <span>{prompt.icon}</span>
            <span>{prompt.label}</span>
          </button>
        ))}
      </div>

      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] sm:max-w-[78%] ${
                  isUser
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'bg-[#141726] border border-neutral-800 text-neutral-200 shadow-sm'
                }`}
              >
                {isUser ? <p>{msg.content}</p> : renderFormattedText(msg.content)}
              </div>
            </div>
          );
        })}

        {/* Loading Thinking Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#141726] border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span>Ritho AI is analyzing habits & drafting advice...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
                if (lastUserMessage) {
                  sendMessage(lastUserMessage.content);
                } else {
                  sendMessage('Analyze my current habit consistency and provide advice');
                }
              }}
              className="text-xs text-violet-400 hover:underline flex items-center gap-1 shrink-0 font-medium"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pt-3 border-t border-neutral-800/80 mt-2 shrink-0">
        <div className="flex items-center gap-2 bg-[#141726] border border-neutral-800 focus-within:border-violet-500 rounded-2xl p-1.5 pl-4 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about habits, consistency, or routine design..."
            disabled={loading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={loading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-violet-600/25 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
