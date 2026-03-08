export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  emoji?: string;
  timestamp: number;
}

export interface WingoResult {
  period: string;
  number: number;
  size: 'Big' | 'Small';
  color: 'Red' | 'Green' | 'Violet';
  timestamp: number;
}

export interface UserProfile {
  name: string;
  appLockPin: string;
  isLockEnabled: boolean;
  memories: Memory[];
}

export interface Memory {
  id: string;
  key: string;
  value: string;
  timestamp: number;
}

export interface WingoState {
  results: WingoResult[];
  currentPeriod: number;
  predictions: WingoPrediction[];
}

export interface WingoPrediction {
  period: string;
  predictedSize: 'Big' | 'Small';
  predictedNumbers: number[];
  confidence: number;
  reasoning: string;
}
