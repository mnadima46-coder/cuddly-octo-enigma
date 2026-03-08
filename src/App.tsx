import { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import RobotAvatar from './components/RobotAvatar';
import WingoAnalysis from './components/WingoAnalysis';
import SettingsPanel, { AppSettings } from './components/SettingsPanel';
import CameraVision from './components/CameraVision';
import { Settings, Mic, MicOff, Send, BarChart3, Camera, MessageSquare, Volume2, VolumeX } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'wingo' | 'camera'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    userName: 'User',
    websiteName: 'Gemini Alpha-X',
    profileImage: null,
    language: 'bn',
    voiceGender: 'female',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    eyeColor: '#00aaff',
    theme: 'dark',
  });

  const t = useCallback((bn: string, en: string) => settings.language === 'bn' ? bn : en, [settings.language]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech synthesis
  const speak = useCallback((text: string) => {
    if (!soundOn) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = settings.voiceSpeed;
    utterance.pitch = settings.voicePitch;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = settings.language === 'bn' ? 'bn' : 'en';
    const genderHint = settings.voiceGender === 'female' ? ['female', 'woman', 'girl', 'zira', 'samantha', 'karen'] : ['male', 'man', 'boy', 'david', 'daniel', 'james'];

    let selectedVoice = voices.find((v) => v.lang.startsWith(langPrefix) && genderHint.some((h) => v.name.toLowerCase().includes(h)));
    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.lang.startsWith(langPrefix));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [soundOn, settings.language, settings.voiceSpeed, settings.voicePitch, settings.voiceGender]);

  // AI Response generation (built-in logic without API)
  const generateResponse = useCallback((userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    const isBn = settings.language === 'bn';
    const name = settings.userName;

    if (msg.match(/হ্যালো|হাই|হেলো|hello|hi|hey|সালাম|আসসালামু/)) {
      return isBn
        ? `আসসালামু আলাইকুম ${name}! আমি ${settings.websiteName} এর এআই সহকারী। আপনাকে কীভাবে সাহায্য করতে পারি? আপনি আমাকে যেকোনো প্রশ্ন করতে পারেন!`
        : `Hello ${name}! I'm the AI assistant of ${settings.websiteName}. How can I help you? Feel free to ask me anything!`;
    }

    if (msg.match(/তুমি কে|আপনি কে|who are you|what are you/)) {
      return isBn
        ? `আমি ${settings.websiteName} এর এআই রোবট সহকারী। আমি আপনার প্রতিটি প্রশ্নের উত্তর দিতে, মার্কেট এনালাইসিস করতে, ছবি বিশ্লেষণ করতে এবং আপনার সাথে কথা বলতে পারি। আপনার প্রতিটি শব্দ আমার কাছে গুরুত্বপূর্ণ!`
        : `I am the AI robot assistant of ${settings.websiteName}. I can answer all your questions, analyze markets, analyze images, and have conversations with you. Every word of yours matters to me!`;
    }

    if (msg.match(/নাম কি|নাম কী|your name|what.*name/)) {
      return isBn
        ? `আমার নাম ${settings.websiteName} AI। আমি আপনার ব্যক্তিগত এআই সহকারী। ${name}, আপনি আমাকে যেকোনো নাম দিতে পারেন সেটিংস থেকে!`
        : `My name is ${settings.websiteName} AI. I'm your personal AI assistant. ${name}, you can give me any name from the settings!`;
    }

    if (msg.match(/wingo|উইনগো|মার্কেট|market|predict|প্রেডিক্ট|চার্ট|chart|big|small|analysis/)) {
      return isBn
        ? `${name}, উইনগো মার্কেট এনালাইসিসের জন্য দয়া করে "মার্কেট এনালাইসিস" ট্যাবে যান। সেখানে আপনি গত রেজাল্ট নম্বর ইনপুট দিলে আমি প্যাটার্ন বিশ্লেষণ করে পরবর্তী প্রেডিকশন দেব। আমি ড্রাগন, মিরর, টুইন সহ বিভিন্ন প্যাটার্ন চিনতে পারি!`
        : `${name}, for Wingo market analysis, please go to the "Market Analysis" tab. Enter past result numbers there and I'll analyze patterns to give predictions. I can detect Dragon, Mirror, Twin and various other patterns!`;
    }

    if (msg.match(/ক্যামেরা|camera|ছবি|photo|image|দেখ|see|look|scan/)) {
      return isBn
        ? `${name}, ক্যামেরা বা ইমেজ এনালাইসিসের জন্য "ক্যামেরা" ট্যাবে যান। সেখানে আপনি লাইভ ক্যামেরা চালু করতে বা গ্যালারি থেকে ছবি আপলোড করতে পারবেন। আমি সেই ছবি দেখে বিস্তারিত বর্ণনা দেব!`
        : `${name}, for camera or image analysis, go to the "Camera" tab. You can turn on the live camera or upload images from your gallery. I'll analyze and describe what I see!`;
    }

    if (msg.match(/সময়|time|clock|ঘণ্টা|বাজে কত/)) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString(isBn ? 'bn-BD' : 'en-US');
      return isBn ? `${name}, এখন সময় হচ্ছে ${timeStr}।` : `${name}, the current time is ${timeStr}.`;
    }

    if (msg.match(/তারিখ|date|আজ|today|দিন/)) {
      const now = new Date();
      const dateStr = now.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return isBn ? `${name}, আজকের তারিখ হচ্ছে ${dateStr}।` : `${name}, today's date is ${dateStr}.`;
    }

    if (msg.match(/(\d+)\s*[+\-*/x×÷]\s*(\d+)/)) {
      try {
        const expr = msg.replace(/x|×/g, '*').replace(/÷/g, '/');
        const mathMatch = expr.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
        if (mathMatch) {
          const a = parseFloat(mathMatch[1]);
          const op = mathMatch[2];
          const b = parseFloat(mathMatch[3]);
          let result = 0;
          switch (op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': result = b !== 0 ? a / b : 0; break;
          }
          return `${name}, ${a} ${op} ${b} = ${result}`;
        }
      } catch (e) { console.log(e); }
    }

    if (msg.match(/ধন্যবাদ|thank|thanks|শুকরিয়া/)) {
      return isBn
        ? `আপনাকেও ধন্যবাদ ${name}! আপনার সাথে কথা বলে আমি খুবই আনন্দিত। যেকোনো সময় আমাকে জিজ্ঞেস করতে পারেন!`
        : `Thank you too, ${name}! I'm so happy to talk with you. Feel free to ask me anytime!`;
    }

    if (msg.match(/help|সাহায্য|কি করতে পার|what can you do|feature/)) {
      return isBn
        ? `${name}, আমি আপনার জন্য অনেক কিছু করতে পারি:\n\n- বাংলা ও ইংরেজিতে কথা বলা\n- উইনগো মার্কেট এনালাইসিস ও প্রেডিকশন\n- ক্যামেরা ও ইমেজ বিশ্লেষণ\n- গণনা ও তথ্য প্রদান\n- সেটিংস কাস্টমাইজেশন\n\nআপনি যেকোনো বিষয়ে প্রশ্ন করতে পারেন!`
        : `${name}, I can do many things for you:\n\n- Speak in Bengali & English\n- Wingo Market Analysis & Predictions\n- Camera & Image Analysis\n- Calculations & Information\n- Settings Customization\n\nFeel free to ask about anything!`;
    }

    if (msg.match(/settings|সেটিংস|পরিবর্তন|change|customize/)) {
      return isBn
        ? `${name}, সেটিংস পরিবর্তন করতে উপরের সেটিংস আইকনে ক্লিক করুন। সেখান থেকে আপনি নাম, ভাষা, ভয়েস, থিম সবকিছু পরিবর্তন করতে পারবেন!`
        : `${name}, click the settings icon at the top to change settings. From there you can customize name, language, voice, theme and more!`;
    }

    const responses_bn = [
      `${name}, এটি একটি চমৎকার প্রশ্ন! আমি আপনার কথা মনোযোগ দিয়ে শুনেছি। এই বিষয়ে আরও বিস্তারিত জানতে আমাকে আরেকটু নির্দিষ্ট করে জিজ্ঞেস করুন।`,
      `${name}, আপনার প্রশ্নটি আমি বুঝতে পেরেছি। আমি সবসময় আপনাকে সঠিক তথ্য দিতে চাই। দয়া করে আরও বিস্তারিত বলুন যাতে আমি আপনাকে সর্বোত্তম উত্তর দিতে পারি।`,
      `ধন্যবাদ ${name}! আপনার প্রতিটি শব্দ আমার কাছে গুরুত্বপূর্ণ। আমি আপনাকে সেরা সমাধান দিতে চেষ্টা করব। আপনি কি এই বিষয়ে আরও কিছু জানতে চান?`,
      `${name}, আমি আপনার সাথে একমত। এই বিষয়টি সত্যিই আকর্ষণীয়। আমি এই নিয়ে আরও আলোচনা করতে প্রস্তুত!`,
    ];
    const responses_en = [
      `${name}, that's a great question! I've listened carefully to you. Please be a bit more specific so I can give you the best answer.`,
      `${name}, I understand your question. I always want to give you accurate information. Please tell me more details so I can help you better.`,
      `Thank you ${name}! Every word of yours matters to me. I'll try to provide the best solution. Would you like to know more about this?`,
      `${name}, I agree with you. This topic is truly fascinating. I'm ready to discuss more about it!`,
    ];
    const responseList = isBn ? responses_bn : responses_en;
    return responseList[Math.floor(Math.random() * responseList.length)];
  }, [settings]);

  // Handle sending messages
  const handleSendMessage = useCallback((text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMsg: ChatMessage = { role: 'user', text: messageText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(messageText);
      const assistantMsg: ChatMessage = { role: 'assistant', text: response, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
      speak(response);
    }, 800 + Math.random() * 1200);
  }, [inputText, generateResponse, speak]);

  // Speech recognition
  const toggleMic = useCallback(() => {
    if (micOn) {
      recognitionRef.current?.stop();
      setMicOn(false);
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert(t('আপনার ব্রাউজার স্পিচ রিকগনিশন সাপোর্ট করে না', 'Your browser does not support speech recognition'));
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = settings.language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        handleSendMessage(finalTranscript);
      }
    };

    recognition.onstart = () => { setIsListening(true); setMicOn(true); };
    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition error', e.error);
      if (e.error !== 'no-speech') { setMicOn(false); setIsListening(false); }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setMicOn(true);
  }, [micOn, settings.language, t, handleSendMessage]);

  // Handle image analysis
  const handleAnalyzeImage = useCallback((_imageData: string, question?: string) => {
    const isBn = settings.language === 'bn';
    const name = settings.userName;
    const response = question
      ? (isBn
        ? `${name}, আমি আপনার আপলোড করা ছবিটি বিশ্লেষণ করেছি। "${question}" - এই প্রশ্নের উত্তরে বলতে পারি, ছবিতে আমি বিভিন্ন উপাদান দেখতে পাচ্ছি। সম্পূর্ণ AI ভিশন ক্ষমতার জন্য একটি AI API key প্রয়োজন হবে। তবে আমি আপনার প্রশ্নের উত্তর দিতে সর্বদা প্রস্তুত!`
        : `${name}, I've analyzed your uploaded image. Regarding "${question}" - I can see various elements in the image. For full AI vision capabilities, an AI API key would be needed. However, I'm always ready to answer your questions!`)
      : (isBn
        ? `${name}, আমি আপনার ছবিটি পেয়েছি! সম্পূর্ণ ইমেজ এনালাইসিসের জন্য AI API key ইন্টিগ্রেশন প্রয়োজন। তবে আপনি আমাকে এই ছবি নিয়ে যেকোনো প্রশ্ন করতে পারেন!`
        : `${name}, I received your image! For full image analysis, AI API key integration is needed. However, you can ask me any question about this image!`);

    setMessages((prev) => [...prev, { role: 'assistant', text: response, timestamp: new Date() }]);
    setActiveTab('chat');
    speak(response);
  }, [settings, speak]);

  // Welcome message on first login
  useEffect(() => {
    if (isLoggedIn && messages.length === 0) {
      const welcomeMsg = settings.language === 'bn'
        ? `আসসালামু আলাইকুম ${settings.userName}! আমি ${settings.websiteName} এর এআই রোবট। আপনাকে স্বাগতম! আমি আপনার সব ধরনের প্রশ্নের উত্তর দিতে প্রস্তুত। আপনার প্রতিটি শব্দ আমার কাছে গুরুত্বপূর্ণ। আপনি যেকোনো প্রশ্ন করার পূর্ণ স্বাধীনতা রাখেন!`
        : `Hello ${settings.userName}! I'm the AI robot of ${settings.websiteName}. Welcome! I'm ready to answer all your questions. Every word of yours is important to me. You have full freedom to ask anything!`;
      setTimeout(() => {
        setMessages([{ role: 'assistant', text: welcomeMsg, timestamp: new Date() }]);
        speak(welcomeMsg);
      }, 1000);
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDark = settings.theme === 'dark';
  const bgColor = isDark ? '#000' : '#f0f4f8';
  const panelBg = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)';
  const textColor = isDark ? '#e0e0e0' : '#1a1a1a';
  const borderColor = isDark ? 'rgba(0,255,255,0.2)' : 'rgba(0,100,150,0.2)';

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: bgColor, color: textColor }}>
      {isDark && (
        <div className="fixed inset-0 pointer-events-none" style={{
          background: `radial-gradient(circle at 30% 50%, ${settings.eyeColor}08 0%, transparent 50%), radial-gradient(circle at 70% 50%, ${settings.eyeColor}05 0%, transparent 50%)`,
        }} />
      )}

      <header
        className="relative z-20 flex items-center justify-between px-4 py-3"
        style={{
          background: isDark ? 'rgba(0,5,15,0.9)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center gap-3">
          <RobotAvatar isSpeaking={isSpeaking} eyeColor={settings.eyeColor} size="small" />
          <div>
            <h1 className="text-lg font-bold" style={{ color: settings.eyeColor, textShadow: isDark ? `0 0 10px ${settings.eyeColor}44` : 'none' }}>
              {settings.websiteName}
            </h1>
            <p className="text-xs opacity-60">
              {isSpeaking ? t('কথা বলছে...', 'Speaking...') : isListening ? t('শুনছে...', 'Listening...') : t('অনলাইন', 'Online')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundOn(!soundOn)} className="p-2 rounded-lg cursor-pointer border-0"
            style={{ background: 'rgba(255,255,255,0.05)', color: soundOn ? settings.eyeColor : '#666' }}>
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg cursor-pointer border-0"
            style={{ background: 'rgba(255,255,255,0.05)', color: settings.eyeColor }}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      <nav className="relative z-20 flex px-4 py-2 gap-2"
        style={{ background: isDark ? 'rgba(0,5,15,0.7)' : 'rgba(245,245,245,0.95)', borderBottom: `1px solid ${borderColor}` }}>
        {([
          { id: 'chat' as const, icon: MessageSquare, label: t('চ্যাট', 'Chat') },
          { id: 'wingo' as const, icon: BarChart3, label: t('মার্কেট', 'Market') },
          { id: 'camera' as const, icon: Camera, label: t('ক্যামেরা', 'Camera') },
        ]).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border-0"
            style={{
              background: activeTab === tab.id ? (isDark ? `${settings.eyeColor}15` : `${settings.eyeColor}20`) : 'transparent',
              color: activeTab === tab.id ? settings.eyeColor : '#888',
              border: activeTab === tab.id ? `1px solid ${settings.eyeColor}44` : '1px solid transparent',
              transition: 'all 0.3s',
            }}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 relative z-10 overflow-hidden flex flex-col">
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-center py-4">
                <RobotAvatar isSpeaking={isSpeaking} eyeColor={settings.eyeColor} size="large" />
              </div>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-xs sm:max-w-sm md:max-w-md rounded-2xl px-4 py-3"
                    style={{
                      background: msg.role === 'user' ? (isDark ? `${settings.eyeColor}20` : `${settings.eyeColor}15`) : (isDark ? panelBg : 'rgba(0,0,0,0.05)'),
                      border: `1px solid ${msg.role === 'user' ? `${settings.eyeColor}33` : borderColor}`,
                      backdropFilter: 'blur(10px)',
                      animation: 'slideUp 0.3s ease-out',
                    }}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: msg.role === 'user' ? settings.eyeColor : textColor }}>
                      {msg.text}
                    </p>
                    <p className="text-xs mt-1 opacity-40">
                      {msg.timestamp.toLocaleTimeString(settings.language === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 flex items-center gap-1"
                    style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="w-2 h-2 rounded-full"
                        style={{ background: settings.eyeColor, animation: 'typing-dots 1.4s infinite', animationDelay: `${j * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4" style={{
              background: isDark ? 'rgba(0,5,15,0.9)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: `1px solid ${borderColor}`,
            }}>
              <div className="flex items-center gap-3">
                <button onClick={toggleMic} className="p-3 rounded-xl cursor-pointer border-0 flex-shrink-0"
                  style={{
                    background: micOn ? `${settings.eyeColor}20` : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${micOn ? settings.eyeColor : 'rgba(255,255,255,0.1)'}`,
                    color: micOn ? settings.eyeColor : '#666',
                    transition: 'all 0.3s',
                    boxShadow: micOn ? `0 0 15px ${settings.eyeColor}33` : 'none',
                  }}>
                  {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('আপনার বার্তা লিখুন...', 'Type your message...')}
                  className="flex-1"
                  style={{
                    background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)',
                    border: `2px solid ${isDark ? `${settings.eyeColor}33` : 'rgba(0,0,0,0.1)'}`,
                    color: isDark ? '#fff' : '#000',
                    padding: '12px 16px', borderRadius: '12px', outline: 'none', fontSize: '14px',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = settings.eyeColor; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? `${settings.eyeColor}33` : 'rgba(0,0,0,0.1)'; }}
                />
                <button onClick={() => handleSendMessage()} className="p-3 rounded-xl cursor-pointer border-0 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#000', boxShadow: '0 0 10px rgba(255,215,0,0.3)', transition: 'all 0.3s' }}>
                  <Send size={20} />
                </button>
              </div>
              {isListening && (
                <div className="flex items-center gap-2 mt-2 justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'typing-dots 1s infinite' }} />
                  <span className="text-xs" style={{ color: settings.eyeColor }}>
                    {t('মাইক্রোফোন সক্রিয় - কথা বলুন...', 'Microphone active - speak now...')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wingo' && (
          <div className="flex-1 overflow-y-auto">
            <WingoAnalysis language={settings.language} />
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="flex-1 overflow-y-auto">
            <CameraVision language={settings.language} onAnalyzeImage={handleAnalyzeImage} />
          </div>
        )}
      </main>

      {showSettings && (
        <SettingsPanel settings={settings} onUpdateSettings={setSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App
