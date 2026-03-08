import { WingoResult, WingoPrediction } from '../types';

export function generatePeriodNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const periodInMinute = Math.floor(now.getSeconds() / 30);
  return `${year}${month}${day}${hours}${minutes}${periodInMinute}`;
}

export function getNextPeriodNumber(current: string): string {
  const num = parseInt(current, 10);
  return (num + 1).toString();
}

export function analyzePatterns(results: WingoResult[]): {
  streakType: 'Big' | 'Small' | null;
  streakCount: number;
  bigCount: number;
  smallCount: number;
  hotNumbers: number[];
  coldNumbers: number[];
  alternatingPattern: boolean;
  recentTrend: string;
} {
  if (results.length === 0) {
    return {
      streakType: null,
      streakCount: 0,
      bigCount: 0,
      smallCount: 0,
      hotNumbers: [],
      coldNumbers: [],
      alternatingPattern: false,
      recentTrend: 'No data',
    };
  }

  const sorted = [...results].sort((a, b) => b.timestamp - a.timestamp);
  const recent = sorted.slice(0, 20);

  // Streak analysis
  let streakType: 'Big' | 'Small' | null = null;
  let streakCount = 0;
  if (recent.length > 0) {
    streakType = recent[0].size;
    streakCount = 1;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].size === streakType) {
        streakCount++;
      } else {
        break;
      }
    }
  }

  // Size counts
  const bigCount = recent.filter((r) => r.size === 'Big').length;
  const smallCount = recent.filter((r) => r.size === 'Small').length;

  // Number frequency
  const numberFreq = new Map<number, number>();
  for (let i = 0; i <= 9; i++) numberFreq.set(i, 0);
  recent.forEach((r) => {
    numberFreq.set(r.number, (numberFreq.get(r.number) || 0) + 1);
  });

  const sortedNums = [...numberFreq.entries()].sort((a, b) => b[1] - a[1]);
  const hotNumbers = sortedNums.slice(0, 3).map((n) => n[0]);
  const coldNumbers = sortedNums.slice(-3).map((n) => n[0]);

  // Alternating pattern
  let alternatingPattern = false;
  if (recent.length >= 4) {
    let isAlternating = true;
    for (let i = 1; i < Math.min(6, recent.length); i++) {
      if (recent[i].size === recent[i - 1].size) {
        isAlternating = false;
        break;
      }
    }
    alternatingPattern = isAlternating;
  }

  // Recent trend
  let recentTrend = 'Neutral';
  if (bigCount > smallCount + 3) recentTrend = 'Strong Big trend';
  else if (smallCount > bigCount + 3) recentTrend = 'Strong Small trend';
  else if (bigCount > smallCount + 1) recentTrend = 'Slight Big lean';
  else if (smallCount > bigCount + 1) recentTrend = 'Slight Small lean';
  else if (alternatingPattern) recentTrend = 'Alternating pattern';

  return {
    streakType,
    streakCount,
    bigCount,
    smallCount,
    hotNumbers,
    coldNumbers,
    alternatingPattern,
    recentTrend,
  };
}

export function predictNext(results: WingoResult[]): WingoPrediction {
  const pattern = analyzePatterns(results);
  const currentPeriod = generatePeriodNumber();
  const nextPeriod = getNextPeriodNumber(currentPeriod);

  let predictedSize: 'Big' | 'Small';
  let confidence: number;
  let reasoning: string;
  const predictedNumbers: number[] = [];

  if (results.length < 3) {
    predictedSize = Math.random() > 0.5 ? 'Big' : 'Small';
    confidence = 45;
    reasoning =
      'Not enough data for pattern analysis. Need at least 3 periods. This is a random suggestion - please add more data for better predictions.';
    predictedNumbers.push(predictedSize === 'Big' ? 7 : 3);
    return { period: nextPeriod, predictedSize, predictedNumbers, confidence, reasoning };
  }

  // Strategy 1: Streak reversal
  if (pattern.streakCount >= 3) {
    predictedSize = pattern.streakType === 'Big' ? 'Small' : 'Big';
    confidence = 60 + Math.min(pattern.streakCount * 5, 25);
    reasoning = `${pattern.streakType} streak of ${pattern.streakCount} detected. Statistically, a reversal to ${predictedSize} is likely. Streak reversal probability increases with longer streaks.`;
  }
  // Strategy 2: Alternating pattern
  else if (pattern.alternatingPattern) {
    const sorted = [...results].sort((a, b) => b.timestamp - a.timestamp);
    predictedSize = sorted[0].size === 'Big' ? 'Small' : 'Big';
    confidence = 70;
    reasoning = `Alternating Big/Small pattern detected over last ${Math.min(6, results.length)} periods. Following the pattern, next should be ${predictedSize}.`;
  }
  // Strategy 3: Trend following
  else if (pattern.bigCount > pattern.smallCount + 2) {
    predictedSize = 'Big';
    confidence = 55 + Math.min((pattern.bigCount - pattern.smallCount) * 3, 20);
    reasoning = `Big trend dominant (${pattern.bigCount}B vs ${pattern.smallCount}S in last 20). Trend continuation expected.`;
  } else if (pattern.smallCount > pattern.bigCount + 2) {
    predictedSize = 'Small';
    confidence = 55 + Math.min((pattern.smallCount - pattern.bigCount) * 3, 20);
    reasoning = `Small trend dominant (${pattern.smallCount}S vs ${pattern.bigCount}B in last 20). Trend continuation expected.`;
  }
  // Strategy 4: Mean reversion
  else {
    const ratio = pattern.bigCount / Math.max(1, pattern.bigCount + pattern.smallCount);
    if (ratio > 0.55) {
      predictedSize = 'Small';
      confidence = 52;
      reasoning = `Near-balanced with slight Big excess (${(ratio * 100).toFixed(0)}%). Mean reversion suggests Small.`;
    } else if (ratio < 0.45) {
      predictedSize = 'Big';
      confidence = 52;
      reasoning = `Near-balanced with slight Small excess (${((1 - ratio) * 100).toFixed(0)}%). Mean reversion suggests Big.`;
    } else {
      predictedSize = Math.random() > 0.5 ? 'Big' : 'Small';
      confidence = 50;
      reasoning = `Market is balanced (${pattern.bigCount}B/${pattern.smallCount}S). Low confidence - consider waiting for a clearer pattern.`;
    }
  }

  // Predict numbers based on hot/cold analysis
  if (predictedSize === 'Big') {
    const bigHot = pattern.hotNumbers.filter((n) => n >= 5);
    predictedNumbers.push(...(bigHot.length > 0 ? bigHot.slice(0, 2) : [7, 8]));
  } else {
    const smallHot = pattern.hotNumbers.filter((n) => n < 5);
    predictedNumbers.push(...(smallHot.length > 0 ? smallHot.slice(0, 2) : [2, 3]));
  }

  if (predictedNumbers.length === 0) {
    predictedNumbers.push(predictedSize === 'Big' ? 6 : 3);
  }

  return { period: nextPeriod, predictedSize, predictedNumbers, confidence, reasoning };
}

export function parseOCRText(text: string): Partial<WingoResult>[] {
  const results: Partial<WingoResult>[] = [];
  const lines = text.split('\n').filter((l) => l.trim());

  for (const line of lines) {
    // Try to find period numbers (long numeric sequences)
    const periodMatch = line.match(/(\d{10,})/);
    // Try to find single digit results
    const numberMatch = line.match(/\b(\d)\b/g);
    // Try to find Big/Small
    const sizeMatch = line.match(/\b(Big|Small|big|small|BIG|SMALL)\b/i);

    if (periodMatch || numberMatch || sizeMatch) {
      const result: Partial<WingoResult> = {};
      if (periodMatch) result.period = periodMatch[1];
      if (numberMatch && numberMatch.length > 0) {
        const num = parseInt(numberMatch[numberMatch.length - 1], 10);
        result.number = num;
        result.size = num >= 5 ? 'Big' : 'Small';
        if (num === 0 || num === 5) result.color = 'Violet';
        else if (num % 2 === 0) result.color = 'Red';
        else result.color = 'Green';
      }
      if (sizeMatch) {
        result.size = sizeMatch[1].toLowerCase() === 'big' ? 'Big' : 'Small';
      }
      results.push(result);
    }
  }

  return results;
}

export function getTradeAdvice(
  question: string,
  results: WingoResult[]
): { answer: string; emoji: string } {
  const pattern = analyzePatterns(results);
  const prediction = predictNext(results);
  const q = question.toLowerCase();

  if (q.includes('why') || q.includes('keno') || q.includes('keno')) {
    return {
      answer: `Based on my analysis: ${prediction.reasoning} Confidence: ${prediction.confidence}%. The pattern shows ${pattern.recentTrend}. Hot numbers: ${pattern.hotNumbers.join(', ')}. I recommend ${prediction.predictedSize} for period ${prediction.period}.`,
      emoji: '🧠',
    };
  }

  if (q.includes('second') || q.includes('time') || q.includes('when') || q.includes('কত সেকেন্ড')) {
    const secondsLeft = 30 - (new Date().getSeconds() % 30);
    return {
      answer: `Current period closes in ${secondsLeft} seconds. I suggest entering the trade within the first 15 seconds of the next period for optimal timing. Wait ${secondsLeft}s, then place your ${prediction.predictedSize} trade immediately.`,
      emoji: '⏱️',
    };
  }

  if (q.includes('safe') || q.includes('risk') || q.includes('নিরাপদ')) {
    const riskLevel =
      prediction.confidence >= 70
        ? 'LOW risk'
        : prediction.confidence >= 55
          ? 'MODERATE risk'
          : 'HIGH risk';
    return {
      answer: `Current risk level: ${riskLevel} (Confidence: ${prediction.confidence}%). ${prediction.confidence >= 60 ? 'This is a reasonable entry point.' : 'Consider waiting for a clearer signal.'} Pattern: ${pattern.recentTrend}.`,
      emoji: prediction.confidence >= 60 ? '✅' : '⚠️',
    };
  }

  if (q.includes('strategy') || q.includes('plan') || q.includes('কৌশল')) {
    return {
      answer: `Current Strategy: ${pattern.alternatingPattern ? 'ALTERNATING PLAY - Follow the zigzag pattern' : pattern.streakCount >= 3 ? 'REVERSAL PLAY - Streak about to break' : 'TREND FOLLOW - Go with the dominant flow'}. Prediction: ${prediction.predictedSize} (${prediction.confidence}%). Suggested numbers: ${prediction.predictedNumbers.join(', ')}.`,
      emoji: '📊',
    };
  }

  // Default comprehensive answer
  return {
    answer: `My analysis for next period: ${prediction.predictedSize} (${prediction.confidence}% confidence). Numbers to watch: ${prediction.predictedNumbers.join(', ')}. ${prediction.reasoning}`,
    emoji: '🎯',
  };
}
