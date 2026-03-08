import { useState, useEffect } from 'react';

interface BatteryState {
  level: number;
  charging: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export function useBattery(): BatteryState {
  const [battery, setBattery] = useState<BatteryState>({
    level: 100,
    charging: false,
  });

  useEffect(() => {
    let batteryManager: BatteryManager | null = null;

    const updateBattery = (bm: BatteryManager) => {
      setBattery({
        level: Math.round(bm.level * 100),
        charging: bm.charging,
      });
    };

    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManager>;
    };

    if (nav.getBattery) {
      nav.getBattery().then((bm) => {
        batteryManager = bm;
        updateBattery(bm);

        const handler = () => updateBattery(bm);
        bm.addEventListener('levelchange', handler);
        bm.addEventListener('chargingchange', handler);
      });
    }

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', () => {});
        batteryManager.removeEventListener('chargingchange', () => {});
      }
    };
  }, []);

  return battery;
}
