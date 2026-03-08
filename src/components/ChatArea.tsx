import { useEffect, useRef } from 'react';
import { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-3 py-2 space-y-3"
      style={{
        background: 'linear-gradient(180deg, #0d0520 0%, #1a0a2e 50%, #0d0520 100%)',
      }}
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full opacity-60 text-center px-4">
          <p className="text-pink-300 text-sm mb-2">Welcome to Reeti-X!</p>
          <p className="text-pink-200 text-xs">
            Type or speak to start a conversation. Ask about Wingo predictions, save memories, or just chat!
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
            }`}
            style={
              msg.role === 'user'
                ? {
                    background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
                    color: '#fff',
                    boxShadow: '0 2px 10px rgba(255, 105, 180, 0.3)',
                  }
                : {
                    background: 'linear-gradient(135deg, #2a1a3e 0%, #3d2560 100%)',
                    color: '#ffe0f0',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    boxShadow: '0 2px 10px rgba(255, 215, 0, 0.1)',
                  }
            }
          >
            {msg.role === 'assistant' && msg.emoji && (
              <span className="text-lg mr-1">{msg.emoji}</span>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
            <p
              className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-pink-200' : 'text-pink-400'
              } text-right`}
            >
              {formatTime(msg.timestamp)}
            </p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
