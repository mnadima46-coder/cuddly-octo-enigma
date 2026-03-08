import { useState, useRef } from 'react';
import { Mic, MicOff, Send, Camera, Image } from 'lucide-react';

interface InputBarProps {
  onSend: (text: string) => void;
  onMicToggle: () => void;
  onImageUpload: (file: File) => void;
  isListening: boolean;
  isSpeaking: boolean;
  voiceSupported: boolean;
}

export function InputBar({
  onSend,
  onMicToggle,
  onImageUpload,
  isListening,
  isSpeaking,
  voiceSupported,
}: InputBarProps) {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div
      className="px-3 py-3"
      style={{
        background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 100%)',
        borderTop: '1px solid rgba(255, 215, 0, 0.2)',
      }}
    >
      {/* OCR buttons row */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #2a1a3e, #3d2560)',
            color: '#ffd700',
            border: '1px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <Camera size={14} />
          <span>Camera OCR</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #2a1a3e, #3d2560)',
            color: '#ffd700',
            border: '1px solid rgba(255, 215, 0, 0.3)',
          }}
        >
          <Image size={14} />
          <span>Gallery OCR</span>
        </button>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Main input row */}
      <div className="flex items-end gap-2">
        {/* Mic button */}
        {voiceSupported && (
          <button
            onClick={onMicToggle}
            disabled={isSpeaking}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isListening ? 'animate-pulse' : ''
            }`}
            style={{
              background: isListening
                ? 'linear-gradient(135deg, #ff1493, #ff69b4)'
                : 'linear-gradient(135deg, #2a1a3e, #3d2560)',
              border: `2px solid ${isListening ? '#ff69b4' : 'rgba(255, 215, 0, 0.3)'}`,
              boxShadow: isListening ? '0 0 20px rgba(255, 20, 147, 0.5)' : 'none',
              opacity: isSpeaking ? 0.5 : 1,
            }}
          >
            {isListening ? (
              <MicOff size={18} color="#fff" />
            ) : (
              <Mic size={18} color="#ffd700" />
            )}
          </button>
        )}

        {/* Text input */}
        <div
          className="flex-1 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #2a1a3e, #1a0a2e)',
            border: '1px solid rgba(255, 105, 180, 0.3)',
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="w-full px-4 py-2.5 text-sm resize-none focus:outline-none"
            style={{
              background: 'transparent',
              color: '#ffe0f0',
              caretColor: '#ff69b4',
              maxHeight: '80px',
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: text.trim()
              ? 'linear-gradient(135deg, #ff69b4, #ffd700)'
              : 'linear-gradient(135deg, #2a1a3e, #3d2560)',
            boxShadow: text.trim() ? '0 2px 10px rgba(255, 105, 180, 0.4)' : 'none',
            opacity: text.trim() ? 1 : 0.5,
          }}
        >
          <Send size={18} color={text.trim() ? '#fff' : '#666'} />
        </button>
      </div>
    </div>
  );
}
