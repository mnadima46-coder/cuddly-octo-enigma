import { useEffect, useState } from 'react';

interface RobotAvatarProps {
  isSpeaking: boolean;
  eyeColor: string;
  size?: 'small' | 'large';
}

const RobotAvatar = ({ isSpeaking, eyeColor, size = 'large' }: RobotAvatarProps) => {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const s = size === 'large' ? 280 : 120;
  const isLarge = size === 'large';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: `${s}px`,
        height: `${s}px`,
        animation: isSpeaking ? undefined : 'robot-breathe 4s ease-in-out infinite',
      }}
    >
      {/* Glow behind robot */}
      <div
        className="absolute rounded-full"
        style={{
          width: `${s * 1.2}px`,
          height: `${s * 1.2}px`,
          background: `radial-gradient(circle, ${eyeColor}15 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />

      {/* Robot image with overlay effects */}
      <div className="relative" style={{ width: `${s}px`, height: `${s}px` }}>
        <img
          src="/robot.jpg"
          alt="Gemini Alpha-X Robot"
          className="w-full h-full object-contain rounded-2xl"
          style={{
            filter: `drop-shadow(0 0 ${isLarge ? 20 : 8}px ${eyeColor}66)`,
          }}
        />

        {/* Dynamic eye overlays */}
        {isLarge && (
          <>
            {/* Left eye glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: '28px',
                height: blinking ? '3px' : '28px',
                left: '34%',
                top: '36%',
                background: `radial-gradient(circle, ${eyeColor} 0%, transparent 70%)`,
                boxShadow: `0 0 15px ${eyeColor}, 0 0 30px ${eyeColor}66`,
                transition: 'height 0.1s ease',
                opacity: 0.6,
                borderRadius: '50%',
              }}
            />
            {/* Right eye glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: '28px',
                height: blinking ? '3px' : '28px',
                right: '30%',
                top: '36%',
                background: `radial-gradient(circle, ${eyeColor} 0%, transparent 70%)`,
                boxShadow: `0 0 15px ${eyeColor}, 0 0 30px ${eyeColor}66`,
                transition: 'height 0.1s ease',
                opacity: 0.6,
                borderRadius: '50%',
              }}
            />
          </>
        )}

        {/* Speaking mouth animation */}
        {isSpeaking && isLarge && (
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: '32%',
              width: '30px',
              background: eyeColor,
              boxShadow: `0 0 10px ${eyeColor}`,
              animation: 'mouth-talk 0.3s infinite',
              opacity: 0.5,
            }}
          />
        )}

        {/* Neon lighting effects that sync with voice */}
        {isSpeaking && (
          <>
            {/* Left ear glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: '12px',
                height: '12px',
                left: '10%',
                top: '35%',
                background: eyeColor,
                boxShadow: `0 0 15px ${eyeColor}, 0 0 25px ${eyeColor}`,
                animation: 'typing-dots 0.5s infinite',
                opacity: 0.7,
              }}
            />
            {/* Right ear glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: '12px',
                height: '12px',
                right: '8%',
                top: '35%',
                background: eyeColor,
                boxShadow: `0 0 15px ${eyeColor}, 0 0 25px ${eyeColor}`,
                animation: 'typing-dots 0.5s infinite 0.25s',
                opacity: 0.7,
              }}
            />
            {/* Chest glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: '16px',
                height: '16px',
                left: '50%',
                bottom: '15%',
                transform: 'translateX(-50%)',
                background: eyeColor,
                boxShadow: `0 0 20px ${eyeColor}`,
                animation: 'typing-dots 0.4s infinite 0.1s',
                opacity: 0.5,
              }}
            />
          </>
        )}

        {/* Hand glow effect (the extended hand in the image) */}
        {isLarge && (
          <div
            className="absolute rounded-full"
            style={{
              width: '20px',
              height: '20px',
              left: '15%',
              bottom: '30%',
              background: `radial-gradient(circle, ${eyeColor}66 0%, transparent 70%)`,
              boxShadow: `0 0 15px ${eyeColor}44`,
              animation: 'glow-pulse 2s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Voice wave visualization */}
      {isSpeaking && isLarge && (
        <div className="absolute -bottom-4 flex items-end gap-1 h-6">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                background: eyeColor,
                boxShadow: `0 0 5px ${eyeColor}`,
                animation: `voice-wave ${0.3 + Math.random() * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
                minHeight: '4px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RobotAvatar;
