import { WingoResult, UserProfile } from '../types';
import { getTradeAdvice, predictNext, analyzePatterns } from './wingoEngine';
import { getMemories } from './storage';

const GREETINGS = [
  'হ্যালো', 'hello', 'hi', 'hey', 'সুপ্রভাত', 'শুভ', 'good morning',
  'good evening', 'good afternoon', 'নমস্কার', 'আসসালামু', 'assalamu',
];

const WINGO_KEYWORDS = [
  'wingo', 'trade', 'predict', 'big', 'small', 'period', 'result',
  'ট্রেড', 'প্রেডিকশন', 'উইঙ্গো', 'পিরিয়ড', 'রেজাল্ট', 'analysis',
  'next', 'number', 'color', 'নম্বর', 'কালার', 'bet', 'বেট',
];

const MEMORY_KEYWORDS = [
  'remember', 'save', 'store', 'মনে', 'সেভ', 'রাখো', 'note',
];

const RECALL_KEYWORDS = [
  'recall', 'what did i', 'কি বলেছিলাম', 'মনে আছে', 'do you remember',
];

function getContextualEmoji(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('happy') || lower.includes('খুশি') || lower.includes('win') || lower.includes('জিতে'))
    return '😊';
  if (lower.includes('sad') || lower.includes('দুঃখ') || lower.includes('loss') || lower.includes('হেরে'))
    return '😢';
  if (lower.includes('angry') || lower.includes('রাগ'))
    return '😤';
  if (lower.includes('love') || lower.includes('ভালোবাসা'))
    return '💕';
  if (lower.includes('think') || lower.includes('চিন্তা') || lower.includes('analyze'))
    return '🤔';
  if (lower.includes('money') || lower.includes('টাকা') || lower.includes('profit'))
    return '💰';
  if (lower.includes('danger') || lower.includes('risk') || lower.includes('warning'))
    return '⚠️';
  if (lower.includes('great') || lower.includes('excellent') || lower.includes('অসাধারণ'))
    return '🌟';
  if (lower.includes('trade') || lower.includes('wingo') || lower.includes('predict'))
    return '🎯';
  if (lower.includes('time') || lower.includes('সময়'))
    return '⏰';
  if (lower.includes('help') || lower.includes('সাহায্য'))
    return '🤝';
  return '💎';
}

export function generateResponse(
  input: string,
  profile: UserProfile,
  wingoResults: WingoResult[]
): { text: string; emoji: string } {
  const lower = input.toLowerCase().trim();
  const userName = profile.name || 'User';
  const honorific = profile.name ? `${profile.name} সাহেব` : 'Dear User';

  // Greeting
  if (GREETINGS.some((g) => lower.includes(g))) {
    const hour = new Date().getHours();
    let timeGreeting = 'শুভ সন্ধ্যা';
    if (hour < 12) timeGreeting = 'সুপ্রভাত';
    else if (hour < 17) timeGreeting = 'শুভ অপরাহ্ন';

    return {
      text: `${timeGreeting}, ${honorific}! 💖 আমি Reeti-X, আপনার পার্সোনাল স্মার্ট অ্যাসিস্ট্যান্ট। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি? Wingo analysis, data save, বা যেকোনো প্রশ্ন - আমি সবসময় আপনার পাশে আছি! 🌹`,
      emoji: '👋',
    };
  }

  // Memory save
  if (MEMORY_KEYWORDS.some((k) => lower.includes(k))) {
    return {
      text: `অবশ্যই ${honorific}! আমি এটি আমার মেমোরিতে সেভ করে রাখছি। আপনি Settings > Memories থেকে আপনার সকল সেভ করা ডাটা দেখতে ও ম্যানেজ করতে পারবেন। আমি lifetime এটি মনে রাখবো! 🧠`,
      emoji: '💾',
    };
  }

  // Memory recall
  if (RECALL_KEYWORDS.some((k) => lower.includes(k))) {
    const memories = getMemories();
    if (memories.length === 0) {
      return {
        text: `${honorific}, আপনি এখনও কোনো ডাটা সেভ করেননি। আমাকে কিছু মনে রাখতে বলুন, আমি lifetime সেভ করে রাখবো! 📝`,
        emoji: '📋',
      };
    }
    const memList = memories
      .slice(-5)
      .map((m) => `• ${m.key}: ${m.value}`)
      .join('\n');
    return {
      text: `হ্যাঁ ${honorific}, আমি সব মনে আছে! আপনার সর্বশেষ সেভ করা তথ্য:\n${memList}\n\nSettings > Memories তে সব দেখতে পারবেন! 🧠`,
      emoji: '🧠',
    };
  }

  // Wingo related
  if (WINGO_KEYWORDS.some((k) => lower.includes(k))) {
    if (wingoResults.length === 0) {
      return {
        text: `${honorific}, এখনও কোনো Wingo ডাটা নেই। প্রথমে কিছু period result যোগ করুন - আপনি manually টাইপ করতে পারেন বা screenshot দিয়ে OCR দিয়ে স্ক্যান করতে পারেন। ডাটা পেলে আমি নিখুঁত analysis দেবো! 📊`,
        emoji: '📈',
      };
    }
    const advice = getTradeAdvice(input, wingoResults);
    return {
      text: `${honorific}, ${advice.answer}`,
      emoji: advice.emoji,
    };
  }

  // Specific Wingo questions
  if (lower.includes('কেন') || lower.includes('why')) {
    if (wingoResults.length > 0) {
      const advice = getTradeAdvice(input, wingoResults);
      return { text: `${honorific}, ${advice.answer}`, emoji: advice.emoji };
    }
  }

  if (lower.includes('কত সেকেন্ড') || lower.includes('second') || lower.includes('timing')) {
    const advice = getTradeAdvice(input, wingoResults);
    return { text: `${honorific}, ${advice.answer}`, emoji: advice.emoji };
  }

  // About self
  if (lower.includes('who are you') || lower.includes('তুমি কে') || lower.includes('your name') || lower.includes('তোমার নাম')) {
    return {
      text: `আমি Reeti-X! 🌸 আপনার পার্সোনাল AI অ্যাসিস্ট্যান্ট। আমি Wingo market analysis, data management, এবং আরও অনেক কিছুতে সাহায্য করতে পারি। ${userName}, আমি সবসময় আপনার সেবায় প্রস্তুত! 💖`,
      emoji: '🤖',
    };
  }

  // Thank you
  if (lower.includes('thank') || lower.includes('ধন্যবাদ') || lower.includes('শুকরিয়া')) {
    return {
      text: `আপনাকেও ধন্যবাদ, ${honorific}! 💕 আপনার সাথে কাজ করে আমি সবসময় খুশি। আর কিছু লাগলে জানাবেন! 🌹`,
      emoji: '😊',
    };
  }

  // Help
  if (lower.includes('help') || lower.includes('সাহায্য') || lower.includes('কি করতে পার')) {
    return {
      text: `${honorific}, আমি আপনাকে এভাবে সাহায্য করতে পারি:\n\n🎯 Wingo Analysis - "next prediction" বা "analyze market"\n📸 OCR Scan - Screenshot দিয়ে auto-read\n💾 Memory - "remember my address is..."\n🗣️ Voice - Mic button দিয়ে কথা বলুন\n⚙️ Settings - নাম, App Lock সেটআপ\n\nযেকোনো প্রশ্ন করুন, আমি উত্তর দেবো! 💎`,
      emoji: '🤝',
    };
  }

  // Default intelligent response
  const emoji = getContextualEmoji(input);
  const prediction = wingoResults.length > 0 ? predictNext(wingoResults) : null;
  const pattern = wingoResults.length > 0 ? analyzePatterns(wingoResults) : null;

  let wingoHint = '';
  if (prediction && pattern) {
    wingoHint = ` Wingo update: Next prediction ${prediction.predictedSize} (${prediction.confidence}% confidence). Market trend: ${pattern.recentTrend}.`;
  }

  return {
    text: `${honorific}, আপনার প্রশ্ন পেয়েছি। ${input.length > 50 ? 'বিস্তারিত প্রশ্নের জন্য ধন্যবাদ।' : ''} আমি আপনাকে সর্বোচ্চ সাহায্য করতে চাই। Wingo analysis, data save, বা অন্য যেকোনো বিষয়ে নির্দ্বিধায় জিজ্ঞেস করুন!${wingoHint} 💎`,
    emoji,
  };
}
