import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface AppLockProps {
  onUnlock: (pin: string) => void;
  correctPin: string;
}

export function AppLock({ onUnlock, correctPin }: AppLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === correctPin.length) {
      if (newPin === correctPin) {
        onUnlock(newPin);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setPin('');
          setShake(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: 'linear-gradient(180deg, #0d0520 0%, #1a0a2e 50%, #2d1b4e 100%)',
      }}
    >
      {/* Lock Icon */}
      <div className="mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #2a1a3e, #3d2560)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 0 30px rgba(255, 105, 180, 0.2)',
          }}
        >
          {error ? (
            <Lock size={36} color="#ff4444" />
          ) : (
            <ShieldCheck size={36} color="#ffd700" />
          )}
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-2xl font-bold mb-2"
        style={{
          background: 'linear-gradient(90deg, #ff69b4, #ffd700)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Reeti-X Locked
      </h1>
      <p className="text-pink-300 text-sm mb-8">Enter your PIN to unlock</p>

      {/* PIN dots */}
      <div className={`flex gap-3 mb-8 ${shake ? 'animate-shake' : ''}`}>
        {Array.from({ length: correctPin.length }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full transition-all duration-200"
            style={{
              background:
                i < pin.length
                  ? error
                    ? '#ff4444'
                    : 'linear-gradient(135deg, #ff69b4, #ffd700)'
                  : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow:
                i < pin.length && !error ? '0 0 8px rgba(255, 105, 180, 0.5)' : 'none',
            }}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-4 animate-pulse">Incorrect PIN. Try again.</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 w-64">
        {digits.map((digit, i) => {
          if (digit === '') return <div key={i} />;
          if (digit === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="h-14 rounded-2xl flex items-center justify-center text-pink-300 text-sm font-medium transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #2a1a3e, #1a0a2e)',
                  border: '1px solid rgba(255, 105, 180, 0.2)',
                }}
              >
                Delete
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #2a1a3e, #3d2560)',
                color: '#ffd700',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {digit}
            </button>
          );
        })}
      </div>
    </div>
  );
}
