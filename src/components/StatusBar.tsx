import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Battery, BatteryCharging, Signal } from 'lucide-react';
import { useBattery } from '../hooks/useBattery';

export function StatusBar() {
  const [time, setTime] = useState(new Date());
  const [online, setOnline] = useState(navigator.onLine);
  const battery = useBattery();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs font-medium"
      style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)',
        color: '#ffd700',
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
      }}
    >
      <div className="flex items-center gap-2">
        <Signal size={12} className="text-pink-400" />
        <span className="text-pink-300">{formatDate(time)}</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-lg font-bold tracking-wider"
          style={{
            background: 'linear-gradient(90deg, #ff69b4, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {formatTime(time)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {online ? (
          <Wifi size={12} className="text-green-400" />
        ) : (
          <WifiOff size={12} className="text-red-400" />
        )}
        <div className="flex items-center gap-1">
          {battery.charging ? (
            <BatteryCharging size={14} className="text-green-400" />
          ) : (
            <Battery size={14} className={battery.level > 20 ? 'text-green-400' : 'text-red-400'} />
          )}
          <span className={`text-xs ${battery.level > 20 ? 'text-green-300' : 'text-red-300'}`}>
            {battery.level}%
          </span>
        </div>
      </div>
    </div>
  );
}
