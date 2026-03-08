import { useEffect, useState } from 'react';

interface RobotAvatarProps {
  emoji: string;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
}

export function RobotAvatar({ emoji, isSpeaking, isListening, isThinking }: RobotAvatarProps) {
  const [eyeBlink, setEyeBlink] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      const pulseInterval = setInterval(() => {
        setPulseScale((prev) => (prev === 1 ? 1.05 : 1));
      }, 300);
      return () => clearInterval(pulseInterval);
    } else {
      setPulseScale(1);
    }
  }, [isSpeaking]);

  const eyeHeight = eyeBlink ? '2px' : '14px';
  const mouthAnimation = isSpeaking ? 'animate-pulse' : '';

  return (
    <div className="flex flex-col items-center py-3">
      {/* Robot Head Container */}
      <div
        className="relative transition-transform duration-300"
        style={{ transform: `scale(${pulseScale})` }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{
            background: isListening
              ? 'radial-gradient(circle, #ff69b4, transparent)'
              : isThinking
                ? 'radial-gradient(circle, #ffd700, transparent)'
                : 'radial-gradient(circle, #ff69b4aa, transparent)',
          }}
        />

        {/* Robot Head */}
        <div
          className="relative w-28 h-32 rounded-3xl flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #2a1a3e 0%, #1a0a2e 100%)',
            border: '2px solid',
            borderImage: 'linear-gradient(180deg, #ff69b4, #ffd700) 1',
            boxShadow: `0 0 20px rgba(255, 105, 180, 0.3), 
                         inset 0 0 20px rgba(255, 215, 0, 0.1)`,
          }}
        >
          {/* Antenna */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${isListening ? 'animate-ping' : ''}`}
              style={{
                background: isListening ? '#ff69b4' : '#ffd700',
                boxShadow: `0 0 10px ${isListening ? '#ff69b4' : '#ffd700'}`,
              }}
            />
            <div className="w-0.5 h-3" style={{ background: 'linear-gradient(#ffd700, #ff69b4)' }} />
          </div>

          {/* Eyes */}
          <div className="flex gap-5 mb-2 mt-2">
            <div
              className="rounded-full transition-all duration-100"
              style={{
                width: '16px',
                height: eyeHeight,
                background: isListening
                  ? '#ff69b4'
                  : isThinking
                    ? '#ffd700'
                    : '#00ffff',
                boxShadow: `0 0 8px ${isListening ? '#ff69b4' : '#00ffff'}`,
                borderRadius: eyeBlink ? '50%' : '40%',
              }}
            />
            <div
              className="rounded-full transition-all duration-100"
              style={{
                width: '16px',
                height: eyeHeight,
                background: isListening
                  ? '#ff69b4'
                  : isThinking
                    ? '#ffd700'
                    : '#00ffff',
                boxShadow: `0 0 8px ${isListening ? '#ff69b4' : '#00ffff'}`,
                borderRadius: eyeBlink ? '50%' : '40%',
              }}
            />
          </div>

          {/* Mouth */}
          <div
            className={`rounded-full ${mouthAnimation}`}
            style={{
              width: isSpeaking ? '20px' : '24px',
              height: isSpeaking ? '12px' : '4px',
              background: 'linear-gradient(90deg, #ff69b4, #ffd700)',
              boxShadow: '0 0 6px #ff69b4',
              transition: 'all 0.15s ease',
              borderRadius: isSpeaking ? '50%' : '10px',
            }}
          />
        </div>

        {/* Robot Body / Display */}
        <div
          className="mx-auto w-24 h-20 -mt-1 rounded-b-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 100%)',
            border: '2px solid',
            borderTop: 'none',
            borderImage: 'linear-gradient(180deg, #ff69b4, #ffd700) 1',
            boxShadow: '0 4px 15px rgba(255, 105, 180, 0.2)',
          }}
        >
          {/* Contextual Emoji Display */}
          <span
            className="text-3xl transition-all duration-500"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))',
            }}
          >
            {emoji}
          </span>
        </div>

        {/* Arms */}
        <div className="absolute top-32 -left-3 w-3 h-10 rounded-full"
          style={{
            background: 'linear-gradient(180deg, #2a1a3e, #1a0a2e)',
            border: '1px solid #ff69b480',
          }}
        />
        <div className="absolute top-32 -right-3 w-3 h-10 rounded-full"
          style={{
            background: 'linear-gradient(180deg, #2a1a3e, #1a0a2e)',
            border: '1px solid #ff69b480',
          }}
        />
      </div>

      {/* Status text */}
      <div className="mt-2 text-center">
        <p
          className="text-xs font-medium tracking-wider"
          style={{
            background: 'linear-gradient(90deg, #ff69b4, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isListening ? '🎙️ Listening...' : isSpeaking ? '🔊 Speaking...' : isThinking ? '🤔 Thinking...' : '✨ REETI-X Online'}
        </p>
      </div>
    </div>
  );
}
