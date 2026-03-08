import { useState, useEffect, useCallback } from 'react';
import { Settings, BarChart3 } from 'lucide-react';
import { Message, WingoResult, UserProfile } from './types';
import { getProfile, saveProfile, getWingoResults, saveWingoResults, isAppLocked, unlockApp } from './utils/storage';
import { generateResponse } from './utils/aiResponder';
import { parseOCRText } from './utils/wingoEngine';
import { useVoice } from './hooks/useVoice';
import { StatusBar } from './components/StatusBar';
import { RobotAvatar } from './components/RobotAvatar';
import { ChatArea } from './components/ChatArea';
import { InputBar } from './components/InputBar';
import { AppLock } from './components/AppLock';
import { SettingsPanel } from './components/SettingsPanel';
import { WingoPanel } from './components/WingoPanel';
import { Portal } from './components/Portal';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [wingoResults, setWingoResults] = useState<WingoResult[]>(getWingoResults());
  const [locked, setLocked] = useState(isAppLocked());
  const [showSettings, setShowSettings] = useState(false);
  const [showWingo, setShowWingo] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState('💎');
  const [isThinking, setIsThinking] = useState(false);

  const voice = useVoice();

  // Handle voice transcript
  useEffect(() => {
    if (voice.transcript) {
      handleUserMessage(voice.transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.transcript]);

  const handleUserMessage = useCallback(
    (text: string) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);
      setCurrentEmoji('🤔');

      // Simulate brief thinking delay
      setTimeout(() => {
        const response = generateResponse(text, profile, wingoResults);
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: response.text,
          emoji: response.emoji,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setCurrentEmoji(response.emoji);
        setIsThinking(false);

        // Auto-speak the response
        voice.speak(response.text);
      }, 500 + Math.random() * 500);
    },
    [profile, wingoResults, voice]
  );

  const handleMicToggle = useCallback(() => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      // Stop any ongoing speech first
      if (voice.isSpeaking) {
        voice.stopSpeaking();
      }
      voice.startListening();
    }
  }, [voice]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      setIsThinking(true);
      setCurrentEmoji('📸');

      const thinkingMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        text: 'Scanning image with OCR... Please wait.',
        emoji: '📸',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, thinkingMsg]);

      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const imageUrl = URL.createObjectURL(file);
        const {
          data: { text },
        } = await worker.recognize(imageUrl);
        await worker.terminate();
        URL.revokeObjectURL(imageUrl);

        const parsed = parseOCRText(text);

        if (parsed.length > 0) {
          let addedCount = 0;
          const newResults = [...wingoResults];
          for (const p of parsed) {
            if (p.number !== undefined && p.size) {
              const result: WingoResult = {
                period: p.period || Date.now().toString(),
                number: p.number,
                size: p.size,
                color: p.color || 'Red',
                timestamp: Date.now(),
              };
              newResults.push(result);
              addedCount++;
            }
          }
          setWingoResults(newResults);
          saveWingoResults(newResults);

          const ocrMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: `OCR Scan Complete! Found ${addedCount} result(s) from the image.\n\nExtracted text: "${text.slice(0, 200)}${text.length > 200 ? '...' : ''}"\n\nData has been added to the Wingo Analyzer. Check the Wingo panel for updated predictions!`,
            emoji: '✅',
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, ocrMsg]);
          setCurrentEmoji('✅');
        } else {
          const noDataMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: `OCR Scan Complete. Extracted text: "${text.slice(0, 300)}${text.length > 300 ? '...' : ''}"\n\nI could not find clear period/result data. Please try a clearer screenshot or manually add the data.`,
            emoji: '⚠️',
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, noDataMsg]);
          setCurrentEmoji('⚠️');
        }
      } catch {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Sorry, there was an error scanning the image. Please try again with a clearer image.',
          emoji: '❌',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setCurrentEmoji('❌');
      }

      setIsThinking(false);
    },
    [wingoResults]
  );

  const handleUnlock = (pin: string) => {
    if (pin === profile.appLockPin) {
      unlockApp();
      setLocked(false);
    }
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleAddWingoResult = (result: WingoResult) => {
    const newResults = [...wingoResults, result];
    setWingoResults(newResults);
    saveWingoResults(newResults);
  };

  const handleDeleteWingoResult = (period: string) => {
    const newResults = wingoResults.filter((r) => r.period !== period);
    setWingoResults(newResults);
    saveWingoResults(newResults);
  };

  // Show lock screen
  if (locked && profile.isLockEnabled) {
    return <AppLock onUnlock={handleUnlock} correctPin={profile.appLockPin} />;
  }

  return (
    <>
      <div className="app-container">
        {/* Status Bar */}
        <StatusBar />

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.15)',
          }}
        >
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl transition-all active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 105, 180, 0.2)',
            }}
          >
            <Settings size={20} color="#ffd700" />
          </button>

          <h1
            className="text-xl font-black tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #ff69b4, #ffd700, #ff69b4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
          >
            REETI-X
          </h1>

          <button
            onClick={() => setShowWingo(true)}
            className="p-2 rounded-xl transition-all active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 105, 180, 0.2)',
            }}
          >
            <BarChart3 size={20} color="#ffd700" />
          </button>
        </div>

        {/* Robot Avatar */}
        <RobotAvatar
          emoji={currentEmoji}
          isSpeaking={voice.isSpeaking}
          isListening={voice.isListening}
          isThinking={isThinking}
        />

        {/* Chat Area */}
        <ChatArea messages={messages} />

        {/* Input Bar */}
        <InputBar
          onSend={handleUserMessage}
          onMicToggle={handleMicToggle}
          onImageUpload={handleImageUpload}
          isListening={voice.isListening}
          isSpeaking={voice.isSpeaking}
          voiceSupported={voice.isSupported}
        />
      </div>

      {/* Settings Panel - rendered via portal */}
      {showSettings && (
        <Portal>
          <SettingsPanel
            profile={profile}
            onSave={handleSaveProfile}
            onClose={() => setShowSettings(false)}
          />
        </Portal>
      )}

      {/* Wingo Panel - rendered via portal */}
      {showWingo && (
        <Portal>
          <WingoPanel
            results={wingoResults}
            onAddResult={handleAddWingoResult}
            onDeleteResult={handleDeleteWingoResult}
            onClose={() => setShowWingo(false)}
          />
        </Portal>
      )}
    </>
  );
}

export default App;
