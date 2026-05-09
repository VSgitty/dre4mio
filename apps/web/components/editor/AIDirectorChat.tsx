'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: boolean;
}

interface AIDirectorChatProps {
  projectId: string;
  sceneId: string | null;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Generiere eine Hintergrundszene',
  'Erstelle eine dramatische Einstellung',
  'Füge einen Kamerazoom hinzu',
  'Verbessere die Beleuchtung',
  'Schreibe Dialoge für diese Szene',
  'Erstelle ein Storyboard',
];

export function AIDirectorChat({ projectId, sceneId, onClose }: AIDirectorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hallo! Ich bin dein KI-Regisseur. Ich kann dir helfen, Szenen zu erstellen, Animationen zu generieren, Dialoge zu schreiben und deine Geschichte zum Leben zu erwecken. Was möchtest du erschaffen?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        thinking: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput('');
      setIsStreaming(true);

      try {
        abortRef.current = new AbortController();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ai/director/chat`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content,
              context: { projectId, sceneId },
            }),
            signal: abortRef.current.signal,
          }
        );

        if (!response.ok) throw new Error('Failed to get response');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader');

        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? '';
                fullContent += delta;

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: fullContent, thinking: false }
                      : m
                  )
                );
              } catch {
                // non-JSON line
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: 'Es gab einen Fehler. Bitte versuche es erneut.',
                    thinking: false,
                  }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [projectId, sceneId, isStreaming]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-full flex flex-col bg-monopol-dark/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-monopol-accent to-monopol-purple flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">KI Regisseur</p>
            <p className="text-[10px] text-green-400">Online</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-gray-600 mb-1.5 uppercase tracking-wide">Schnellstart</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-[10px] px-2 py-1 bg-monopol-darker border border-monopol-neon/15 text-monopol-neon/70 rounded-full hover:border-monopol-neon/40 hover:text-monopol-neon transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Idee eingeben..."
            rows={2}
            className="flex-1 resize-none px-3 py-2 bg-monopol-darker border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-monopol-neon/40 leading-relaxed"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 p-2.5 rounded-lg bg-monopol-neon/20 border border-monopol-neon/30 text-monopol-neon hover:bg-monopol-neon/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isStreaming ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[9px] text-gray-700 mt-1.5 text-center">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? 'bg-monopol-neon/15 border border-monopol-neon/25 text-white'
            : 'bg-monopol-darker border border-white/5 text-gray-200'
        }`}
      >
        {message.thinking ? (
          <span className="flex gap-1 items-center text-gray-500">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
          </span>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </motion.div>
  );
}
