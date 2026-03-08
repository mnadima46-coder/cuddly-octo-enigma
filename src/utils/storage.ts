import { UserProfile, WingoResult, Memory } from '../types';

const PROFILE_KEY = 'reeti_x_profile';
const WINGO_KEY = 'reeti_x_wingo';
const LOCK_STATE_KEY = 'reeti_x_locked';

export function getProfile(): UserProfile {
  const stored = localStorage.getItem(PROFILE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    name: '',
    appLockPin: '',
    isLockEnabled: false,
    memories: [],
  };
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getWingoResults(): WingoResult[] {
  const stored = localStorage.getItem(WINGO_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

export function saveWingoResults(results: WingoResult[]): void {
  localStorage.setItem(WINGO_KEY, JSON.stringify(results));
}

export function addMemory(key: string, value: string): Memory {
  const profile = getProfile();
  const memory: Memory = {
    id: Date.now().toString(),
    key,
    value,
    timestamp: Date.now(),
  };
  profile.memories.push(memory);
  saveProfile(profile);
  return memory;
}

export function getMemories(): Memory[] {
  return getProfile().memories;
}

export function deleteMemory(id: string): void {
  const profile = getProfile();
  profile.memories = profile.memories.filter((m) => m.id !== id);
  saveProfile(profile);
}

export function isAppLocked(): boolean {
  const profile = getProfile();
  if (!profile.isLockEnabled) return false;
  return localStorage.getItem(LOCK_STATE_KEY) !== 'unlocked';
}

export function unlockApp(): void {
  localStorage.setItem(LOCK_STATE_KEY, 'unlocked');
}

export function lockApp(): void {
  localStorage.removeItem(LOCK_STATE_KEY);
}
