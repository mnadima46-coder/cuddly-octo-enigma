import { useState } from 'react';
import {
  ArrowLeft,
  User,
  Lock,
  Brain,
  Trash2,
  Plus,
  Save,
} from 'lucide-react';
import { UserProfile, Memory } from '../types';

interface SettingsPanelProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export function SettingsPanel({ profile, onSave, onClose }: SettingsPanelProps) {
  const [editProfile, setEditProfile] = useState<UserProfile>({ ...profile });
  const [activeTab, setActiveTab] = useState<'profile' | 'lock' | 'memory'>('profile');
  const [newMemKey, setNewMemKey] = useState('');
  const [newMemValue, setNewMemValue] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSave = () => {
    onSave(editProfile);
    onClose();
  };

  const handleAddMemory = () => {
    if (!newMemKey.trim() || !newMemValue.trim()) return;
    const memory: Memory = {
      id: Date.now().toString(),
      key: newMemKey.trim(),
      value: newMemValue.trim(),
      timestamp: Date.now(),
    };
    setEditProfile({
      ...editProfile,
      memories: [...editProfile.memories, memory],
    });
    setNewMemKey('');
    setNewMemValue('');
  };

  const handleDeleteMemory = (id: string) => {
    setEditProfile({
      ...editProfile,
      memories: editProfile.memories.filter((m) => m.id !== id),
    });
  };

  const handleSetPin = () => {
    if (newPin.length < 4) return;
    if (newPin !== confirmPin) return;
    setEditProfile({
      ...editProfile,
      appLockPin: newPin,
      isLockEnabled: true,
    });
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
  };

  const handleDisableLock = () => {
    setEditProfile({
      ...editProfile,
      appLockPin: '',
      isLockEnabled: false,
    });
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'lock' as const, label: 'App Lock', icon: Lock },
    { id: 'memory' as const, label: 'Memories', icon: Brain },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0d0520 0%, #1a0a2e 100%)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: 'linear-gradient(135deg, #1a0a2e, #2d1b4e)',
          borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        <button onClick={onClose} className="p-1">
          <ArrowLeft size={22} color="#ffd700" />
        </button>
        <h2
          className="text-lg font-bold"
          style={{
            background: 'linear-gradient(90deg, #ff69b4, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Personal Settings
        </h2>
        <button
          onClick={handleSave}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ff69b4, #ffd700)',
            color: '#fff',
          }}
        >
          <Save size={14} />
          Save
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background:
                activeTab === tab.id
                  ? 'linear-gradient(135deg, #ff69b4, #ffd700)'
                  : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === tab.id ? '#fff' : '#ff69b4',
              border:
                activeTab === tab.id
                  ? 'none'
                  : '1px solid rgba(255, 105, 180, 0.2)',
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-pink-300 text-xs font-medium mb-1.5">
                Your Name (Robot will address you by this name)
              </label>
              <input
                type="text"
                value={editProfile.name}
                onChange={(e) =>
                  setEditProfile({ ...editProfile, name: e.target.value })
                }
                placeholder="e.g., Nadim"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffe0f0',
                  border: '1px solid rgba(255, 105, 180, 0.3)',
                  caretColor: '#ff69b4',
                }}
              />
            </div>
            {editProfile.name && (
              <div
                className="p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(255, 105, 180, 0.1)',
                  border: '1px solid rgba(255, 105, 180, 0.2)',
                  color: '#ffe0f0',
                }}
              >
                Preview: &quot;{editProfile.name} সাহেব, আমি আপনাকে কীভাবে সাহায্য করতে পারি?&quot;
              </div>
            )}
          </div>
        )}

        {/* Lock Tab */}
        {activeTab === 'lock' && (
          <div className="space-y-4">
            {editProfile.isLockEnabled ? (
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(0, 255, 0, 0.05)',
                  border: '1px solid rgba(0, 255, 0, 0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} color="#00ff88" />
                  <span className="text-green-300 text-sm font-medium">
                    App Lock is ACTIVE
                  </span>
                </div>
                <p className="text-green-200 text-xs mb-3">
                  PIN: {'*'.repeat(editProfile.appLockPin.length)}
                </p>
                <button
                  onClick={handleDisableLock}
                  className="px-4 py-2 rounded-lg text-xs font-medium"
                  style={{
                    background: 'rgba(255, 0, 0, 0.2)',
                    color: '#ff6666',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                  }}
                >
                  Disable Lock
                </button>
              </div>
            ) : showPinSetup ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-pink-300 text-xs font-medium mb-1.5">
                    Set PIN (4-6 digits)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="Enter PIN"
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffe0f0',
                      border: '1px solid rgba(255, 105, 180, 0.3)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-pink-300 text-xs font-medium mb-1.5">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="Confirm PIN"
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffe0f0',
                      border: '1px solid rgba(255, 105, 180, 0.3)',
                    }}
                  />
                </div>
                {newPin && confirmPin && newPin !== confirmPin && (
                  <p className="text-red-400 text-xs">PINs do not match</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSetPin}
                    disabled={
                      newPin.length < 4 || newPin !== confirmPin
                    }
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background:
                        newPin.length >= 4 && newPin === confirmPin
                          ? 'linear-gradient(135deg, #ff69b4, #ffd700)'
                          : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      opacity:
                        newPin.length >= 4 && newPin === confirmPin
                          ? 1
                          : 0.5,
                    }}
                  >
                    Set PIN
                  </button>
                  <button
                    onClick={() => {
                      setShowPinSetup(false);
                      setNewPin('');
                      setConfirmPin('');
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-medium"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#ff69b4',
                      border: '1px solid rgba(255, 105, 180, 0.2)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Lock size={40} className="mx-auto mb-3" color="#ff69b480" />
                <p className="text-pink-300 text-sm mb-4">
                  App Lock is not enabled
                </p>
                <button
                  onClick={() => setShowPinSetup(true)}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #ff69b4, #ffd700)',
                    color: '#fff',
                    boxShadow: '0 2px 10px rgba(255, 105, 180, 0.3)',
                  }}
                >
                  Enable App Lock
                </button>
              </div>
            )}
          </div>
        )}

        {/* Memory Tab */}
        {activeTab === 'memory' && (
          <div className="space-y-4">
            {/* Add new memory */}
            <div
              className="p-3 rounded-xl space-y-2"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 215, 0, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Plus size={14} color="#ffd700" />
                <span className="text-xs font-medium text-yellow-300">
                  Add New Memory
                </span>
              </div>
              <input
                type="text"
                value={newMemKey}
                onChange={(e) => setNewMemKey(e.target.value)}
                placeholder="Label (e.g., Home Address)"
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffe0f0',
                  border: '1px solid rgba(255, 105, 180, 0.2)',
                }}
              />
              <input
                type="text"
                value={newMemValue}
                onChange={(e) => setNewMemValue(e.target.value)}
                placeholder="Value (e.g., 123 Main St)"
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffe0f0',
                  border: '1px solid rgba(255, 105, 180, 0.2)',
                }}
              />
              <button
                onClick={handleAddMemory}
                disabled={!newMemKey.trim() || !newMemValue.trim()}
                className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:
                    newMemKey.trim() && newMemValue.trim()
                      ? 'linear-gradient(135deg, #ff69b4, #ffd700)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  opacity:
                    newMemKey.trim() && newMemValue.trim() ? 1 : 0.5,
                }}
              >
                Save to Memory
              </button>
            </div>

            {/* Memory list */}
            {editProfile.memories.length === 0 ? (
              <div className="text-center py-6">
                <Brain size={32} className="mx-auto mb-2" color="#ff69b480" />
                <p className="text-pink-300 text-xs">
                  No memories saved yet. Add data above and I will remember it
                  forever!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {editProfile.memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-start gap-2 p-3 rounded-xl"
                    style={{
                      background: 'rgba(255, 105, 180, 0.05)',
                      border: '1px solid rgba(255, 105, 180, 0.15)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-yellow-300 truncate">
                        {mem.key}
                      </p>
                      <p className="text-xs text-pink-200 mt-0.5">
                        {mem.value}
                      </p>
                      <p className="text-xs text-pink-400 mt-1">
                        {new Date(mem.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1.5 rounded-lg transition-all active:scale-95"
                      style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                      }}
                    >
                      <Trash2 size={14} color="#ff6666" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
