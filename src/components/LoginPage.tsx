import { useState, useEffect, useCallback } from 'react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'password' | 'fingerprint' | 'scanning' | 'success'>('password');
  const [error, setError] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  const playSound = useCallback((type: 'success' | 'scan' | 'error') => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'scan') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio not supported', e);
    }
  }, []);

  const handlePasswordSubmit = () => {
    if (password === '0000') {
      playSound('success');
      setError('');
      setStep('fingerprint');
    } else {
      playSound('error');
      setError('Incorrect password. Try again.');
      setPassword('');
    }
  };

  const handleFingerprint = () => {
    playSound('scan');
    setStep('scanning');
    setTimeout(() => {
      playSound('success');
      setStep('success');
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    }, 2500);
  };

  return (
    <div className="relative w-full min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '2px',
            height: '2px',
            background: '#00ffff',
            boxShadow: '0 0 6px #00ffff',
            animation: `float ${3 + p.delay}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Background radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.08) 0%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* Main login container with 3D glowing circle */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ animation: 'fadeIn 1s ease-out' }}
      >
        {/* Rotating outer ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: '420px',
            height: '420px',
            border: '2px solid transparent',
            borderTopColor: '#00ffff',
            borderRightColor: 'rgba(0,255,255,0.3)',
            borderRadius: '50%',
            animation: 'rotate-border 4s linear infinite',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Second rotating ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: '440px',
            height: '440px',
            border: '1px solid transparent',
            borderBottomColor: 'rgba(0,255,255,0.5)',
            borderLeftColor: 'rgba(0,255,255,0.2)',
            borderRadius: '50%',
            animation: 'rotate-border 6s linear infinite reverse',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Glowing circle container */}
        <div
          className="relative rounded-full flex flex-col items-center justify-center"
          style={{
            width: '380px',
            height: '380px',
            background: 'radial-gradient(circle, rgba(0,20,30,0.9) 0%, rgba(0,0,0,0.95) 100%)',
            border: '2px solid rgba(0,255,255,0.3)',
            boxShadow: '0 0 30px rgba(0,255,255,0.2), 0 0 60px rgba(0,255,255,0.1), inset 0 0 30px rgba(0,255,255,0.05)',
            animation: 'glow-pulse 3s ease-in-out infinite',
          }}
        >
          {/* Welcome text */}
          <h1
            className="text-center font-bold mb-6 select-none"
            style={{
              fontSize: '18px',
              color: '#00ffff',
              textShadow: '0 0 10px #00ffff, 0 0 20px rgba(0,255,255,0.5)',
              animation: 'neon-flicker 3s infinite',
              letterSpacing: '2px',
            }}
          >
            Welcome to<br />
            <span style={{ fontSize: '24px', color: '#fff' }}>Gemini Alpha-X</span>
          </h1>

          {/* Password Step */}
          {step === 'password' && (
            <div className="flex flex-col items-center gap-4 px-8 w-full" style={{ animation: 'slideUp 0.5s ease-out', maxWidth: '300px' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter Access Code"
                className="w-full text-center tracking-widest"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  border: '2px solid rgba(0,255,255,0.4)',
                  color: '#00ffff',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 10px rgba(0,255,255,0.1), inset 0 0 10px rgba(0,255,255,0.05)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00ffff';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,255,255,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,255,0.1), inset 0 0 10px rgba(0,255,255,0.05)';
                }}
              />
              {error && (
                <p className="text-red-400 text-sm" style={{ textShadow: '0 0 5px rgba(255,0,0,0.5)' }}>{error}</p>
              )}
              <button
                onClick={handlePasswordSubmit}
                className="w-full py-3 rounded-xl font-bold text-black cursor-pointer border-0"
                style={{
                  background: 'linear-gradient(135deg, #ffd700, #ffaa00, #ffd700)',
                  boxShadow: '0 0 15px rgba(255,215,0,0.4), 0 0 30px rgba(255,215,0,0.2)',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  letterSpacing: '1px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255,215,0,0.7), 0 0 50px rgba(255,215,0,0.4)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255,215,0,0.4), 0 0 30px rgba(255,215,0,0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                UNLOCK
              </button>
            </div>
          )}

          {/* Fingerprint Step */}
          {step === 'fingerprint' && (
            <div className="flex flex-col items-center gap-3" style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <p className="text-cyan-300 text-sm mb-2" style={{ textShadow: '0 0 5px rgba(0,255,255,0.3)' }}>
                Biometric Verification Required
              </p>
              <button
                onClick={handleFingerprint}
                className="relative cursor-pointer border-0 bg-transparent"
                style={{ width: '100px', height: '100px' }}
              >
                {/* Fingerprint SVG */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  style={{
                    filter: 'drop-shadow(0 0 10px #00ffff)',
                    animation: 'float 2s ease-in-out infinite',
                  }}
                >
                  <defs>
                    <linearGradient id="fpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00ffff" />
                      <stop offset="100%" stopColor="#0088ff" />
                    </linearGradient>
                  </defs>
                  {/* Fingerprint lines */}
                  <path d="M50 15 C30 15 20 30 20 50 C20 70 30 85 50 85" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 20 C33 20 25 33 25 50 C25 67 33 80 50 80" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 25 C36 25 30 36 30 50 C30 64 36 75 50 75" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 30 C39 30 35 39 35 50 C35 61 39 70 50 70" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 35 C42 35 40 42 40 50 C40 58 42 65 50 65" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 40 C45 40 44 45 44 50 C44 55 45 60 50 60" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 15 C70 15 80 30 80 50 C80 70 70 85 50 85" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 20 C67 20 75 33 75 50 C75 67 67 80 50 80" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 25 C64 25 70 36 70 50 C70 64 64 75 50 75" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 30 C61 30 65 39 65 50 C65 61 61 70 50 70" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 35 C58 35 60 42 60 50 C60 58 58 65 50 65" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 40 C55 40 56 45 56 50 C56 55 55 60 50 60" fill="none" stroke="url(#fpGrad)" strokeWidth="2" opacity="0.7"/>
                </svg>
              </button>
              <p className="text-cyan-400 text-xs opacity-70">Touch to scan</p>
            </div>
          )}

          {/* Scanning Step */}
          {step === 'scanning' && (
            <div className="flex flex-col items-center gap-3" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div className="relative" style={{ width: '100px', height: '100px' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 15px #00ffff)' }}>
                  <defs>
                    <linearGradient id="fpGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00ffff" />
                      <stop offset="100%" stopColor="#0088ff" />
                    </linearGradient>
                  </defs>
                  <path d="M50 15 C30 15 20 30 20 50 C20 70 30 85 50 85" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 20 C33 20 25 33 25 50 C25 67 33 80 50 80" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 25 C36 25 30 36 30 50 C30 64 36 75 50 75" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 30 C39 30 35 39 35 50 C35 61 39 70 50 70" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 35 C42 35 40 42 40 50 C40 58 42 65 50 65" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 40 C45 40 44 45 44 50 C44 55 45 60 50 60" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 15 C70 15 80 30 80 50 C80 70 70 85 50 85" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 20 C67 20 75 33 75 50 C75 67 67 80 50 80" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 25 C64 25 70 36 70 50 C70 64 64 75 50 75" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 30 C61 30 65 39 65 50 C65 61 61 70 50 70" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.7"/>
                  <path d="M50 35 C58 35 60 42 60 50 C60 58 58 65 50 65" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.8"/>
                  <path d="M50 40 C55 40 56 45 56 50 C56 55 55 60 50 60" fill="none" stroke="url(#fpGrad2)" strokeWidth="2" opacity="0.7"/>
                </svg>
                {/* Scan line */}
                <div
                  className="absolute left-0 w-full"
                  style={{
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
                    boxShadow: '0 0 10px #00ffff',
                    animation: 'scan-line 1.2s linear infinite',
                    top: '0',
                  }}
                />
              </div>
              <p className="text-cyan-300 text-sm" style={{ textShadow: '0 0 5px rgba(0,255,255,0.5)' }}>
                Scanning biometric data...
              </p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-cyan-400"
                    style={{
                      animation: 'typing-dots 1.4s infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-3" style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,255,100,0.2)',
                  border: '2px solid #00ff64',
                  boxShadow: '0 0 20px rgba(0,255,100,0.4)',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00ff64" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-green-400 font-bold text-lg" style={{ textShadow: '0 0 10px rgba(0,255,100,0.5)' }}>
                Access Granted
              </p>
              <p className="text-cyan-300 text-xs opacity-70">Initializing system...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
