import { useState, useRef } from 'react';
import { Settings, User, Globe, Palette, Volume2, X, Upload } from 'lucide-react';

export interface AppSettings {
  userName: string;
  websiteName: string;
  profileImage: string | null;
  language: 'bn' | 'en';
  voiceGender: 'female' | 'male';
  voiceSpeed: number;
  voicePitch: number;
  eyeColor: string;
  theme: 'dark' | 'light';
}

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onClose: () => void;
}

const SettingsPanel = ({ settings, onUpdateSettings, onClose }: SettingsPanelProps) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'profile' | 'voice' | 'language' | 'theme'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (bn: string, en: string) => settings.language === 'bn' ? bn : en;

  const update = (partial: Partial<AppSettings>) => {
    const newSettings = { ...localSettings, ...partial };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        update({ profileImage: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile' as const, icon: User, label: t('প্রোফাইল', 'Profile') },
    { id: 'voice' as const, icon: Volume2, label: t('ভয়েস', 'Voice') },
    { id: 'language' as const, icon: Globe, label: t('ভাষা', 'Language') },
    { id: 'theme' as const, icon: Palette, label: t('থিম', 'Theme') },
  ];

  const eyeColors = [
    { color: '#00aaff', name: t('নীল', 'Blue') },
    { color: '#ff0066', name: t('লাল', 'Red') },
    { color: '#00ff64', name: t('সবুজ', 'Green') },
    { color: '#ff6600', name: t('কমলা', 'Orange') },
    { color: '#aa00ff', name: t('বেগুনি', 'Purple') },
    { color: '#00ffff', name: t('সায়ান', 'Cyan') },
  ];

  const emojiProfiles = ['🤖', '👾', '🦾', '🧠', '💎', '🔮', '⚡', '🌟'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(5,10,20,0.95)',
          border: '1px solid rgba(0,255,255,0.2)',
          boxShadow: '0 0 40px rgba(0,255,255,0.1)',
          animation: 'fadeIn 0.3s ease-out',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(0,255,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <Settings size={20} color="#00ffff" />
            <h2 className="text-lg font-bold" style={{ color: '#00ffff' }}>
              {t('সেটিংস', 'Settings')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg cursor-pointer border-0"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-1" style={{ borderBottom: '1px solid rgba(0,255,255,0.1)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 flex-1 justify-center"
              style={{
                background: activeTab === tab.id ? 'rgba(0,255,255,0.1)' : 'transparent',
                color: activeTab === tab.id ? '#00ffff' : '#666',
                border: activeTab === tab.id ? '1px solid rgba(0,255,255,0.3)' : '1px solid transparent',
                transition: 'all 0.3s',
              }}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-5" style={{ animation: 'slideUp 0.3s ease-out' }}>
              {/* Profile Image */}
              <div>
                <label className="text-cyan-300 text-sm mb-2 block">{t('প্রোফাইল ছবি', 'Profile Picture')}</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                    style={{ background: 'rgba(0,255,255,0.1)', border: '2px solid rgba(0,255,255,0.3)' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {localSettings.profileImage ? (
                      <img src={localSettings.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={20} color="#00ffff" />
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <div className="flex gap-2 flex-wrap">
                    {emojiProfiles.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => update({ profileImage: emoji })}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer border-0"
                        style={{
                          background: localSettings.profileImage === emoji ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          border: localSettings.profileImage === emoji ? '2px solid #00ffff' : '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-cyan-300 text-sm mb-2 block">{t('আপনার নাম', 'Your Name')}</label>
                <input
                  type="text"
                  value={localSettings.userName}
                  onChange={(e) => update({ userName: e.target.value })}
                  className="w-full"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(0,255,255,0.3)',
                    color: '#00ffff',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Website Name */}
              <div>
                <label className="text-cyan-300 text-sm mb-2 block">{t('ওয়েবসাইটের নাম', 'Website Name')}</label>
                <input
                  type="text"
                  value={localSettings.websiteName}
                  onChange={(e) => update({ websiteName: e.target.value })}
                  className="w-full"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(0,255,255,0.3)',
                    color: '#00ffff',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className="space-y-5" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <div>
                <label className="text-cyan-300 text-sm mb-3 block">{t('কণ্ঠস্বর নির্বাচন', 'Voice Selection')}</label>
                <div className="flex gap-3">
                  {(['female', 'male'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => update({ voiceGender: g })}
                      className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer border-0"
                      style={{
                        background: localSettings.voiceGender === g ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                        border: localSettings.voiceGender === g ? '2px solid #00ffff' : '1px solid rgba(255,255,255,0.1)',
                        color: localSettings.voiceGender === g ? '#00ffff' : '#666',
                        transition: 'all 0.3s',
                      }}
                    >
                      {g === 'female' ? t('🎀 মেয়ে', '🎀 Female') : t('🎤 ছেলে', '🎤 Male')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-cyan-300 text-sm mb-2 block">
                  {t('কথার গতি', 'Speech Speed')}: <span className="text-white">{localSettings.voiceSpeed.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={localSettings.voiceSpeed}
                  onChange={(e) => update({ voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="text-cyan-300 text-sm mb-2 block">
                  {t('কণ্ঠের পিচ', 'Voice Pitch')}: <span className="text-white">{localSettings.voicePitch.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={localSettings.voicePitch}
                  onChange={(e) => update({ voicePitch: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-5" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <label className="text-cyan-300 text-sm mb-3 block">{t('ভাষা নির্বাচন', 'Select Language')}</label>
              <div className="flex gap-3">
                {([{ id: 'bn' as const, label: 'বাংলা', flag: '🇧🇩' }, { id: 'en' as const, label: 'English', flag: '🇺🇸' }]).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => update({ language: lang.id })}
                    className="flex-1 py-4 rounded-xl font-bold text-base cursor-pointer border-0 flex items-center justify-center gap-2"
                    style={{
                      background: localSettings.language === lang.id ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: localSettings.language === lang.id ? '2px solid #00ffff' : '1px solid rgba(255,255,255,0.1)',
                      color: localSettings.language === lang.id ? '#00ffff' : '#666',
                      transition: 'all 0.3s',
                    }}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-5" style={{ animation: 'slideUp 0.3s ease-out' }}>
              {/* Eye/Light Color */}
              <div>
                <label className="text-cyan-300 text-sm mb-3 block">{t('রোবটের চোখের রঙ', 'Robot Eye Color')}</label>
                <div className="flex flex-wrap gap-3">
                  {eyeColors.map((ec) => (
                    <button
                      key={ec.color}
                      onClick={() => update({ eyeColor: ec.color })}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer border-0"
                      style={{
                        background: localSettings.eyeColor === ec.color ? 'rgba(0,255,255,0.1)' : 'transparent',
                        border: localSettings.eyeColor === ec.color ? '2px solid ' + ec.color : '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ background: ec.color, boxShadow: `0 0 10px ${ec.color}` }}
                      />
                      <span className="text-xs text-gray-400">{ec.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dark/Light Mode */}
              <div>
                <label className="text-cyan-300 text-sm mb-3 block">{t('থিম মোড', 'Theme Mode')}</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update({ theme: 'dark' })}
                    className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer border-0"
                    style={{
                      background: localSettings.theme === 'dark' ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: localSettings.theme === 'dark' ? '2px solid #00ffff' : '1px solid rgba(255,255,255,0.1)',
                      color: localSettings.theme === 'dark' ? '#00ffff' : '#666',
                    }}
                  >
                    🌙 {t('নিওন ডার্ক', 'Neon Dark')}
                  </button>
                  <button
                    onClick={() => update({ theme: 'light' })}
                    className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer border-0"
                    style={{
                      background: localSettings.theme === 'light' ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: localSettings.theme === 'light' ? '2px solid #00ffff' : '1px solid rgba(255,255,255,0.1)',
                      color: localSettings.theme === 'light' ? '#00ffff' : '#666',
                    }}
                  >
                    ☀️ {t('ক্লাসিক লাইট', 'Classic Light')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
