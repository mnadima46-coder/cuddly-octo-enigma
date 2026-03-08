import { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Plus,
  Trash2,
  BarChart3,
  Target,
} from 'lucide-react';
import { WingoResult, WingoPrediction } from '../types';
import { predictNext, analyzePatterns, generatePeriodNumber } from '../utils/wingoEngine';

interface WingoPanelProps {
  results: WingoResult[];
  onAddResult: (result: WingoResult) => void;
  onDeleteResult: (period: string) => void;
  onClose: () => void;
}

export function WingoPanel({
  results,
  onAddResult,
  onDeleteResult,
  onClose,
}: WingoPanelProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'predict'>('predict');
  const [manualNumber, setManualNumber] = useState('');
  const [manualPeriod, setManualPeriod] = useState('');

  const pattern = analyzePatterns(results);
  const prediction: WingoPrediction | null = results.length >= 1 ? predictNext(results) : null;
  const currentPeriod = generatePeriodNumber();

  const handleAddManual = () => {
    const num = parseInt(manualNumber, 10);
    if (isNaN(num) || num < 0 || num > 9) return;
    const period = manualPeriod.trim() || currentPeriod;
    const result: WingoResult = {
      period,
      number: num,
      size: num >= 5 ? 'Big' : 'Small',
      color: num === 0 || num === 5 ? 'Violet' : num % 2 === 0 ? 'Red' : 'Green',
      timestamp: Date.now(),
    };
    onAddResult(result);
    setManualNumber('');
    setManualPeriod('');
  };

  const sortedResults = [...results].sort((a, b) => b.timestamp - a.timestamp);

  const tabs = [
    { id: 'predict' as const, label: 'Predict', icon: Target },
    { id: 'analysis' as const, label: 'Analysis', icon: BarChart3 },
    { id: 'data' as const, label: 'Data', icon: TrendingUp },
  ];

  const colorMap = {
    Red: '#ff4444',
    Green: '#44ff44',
    Violet: '#aa44ff',
  };

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
          Wingo Analyzer
        </h2>
        <span className="ml-auto text-xs text-pink-400">
          Period: {currentPeriod}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-1 justify-center"
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
        {/* Prediction Tab */}
        {activeTab === 'predict' && (
          <div className="space-y-4">
            {prediction ? (
              <>
                {/* Main Prediction Card */}
                <div
                  className="p-4 rounded-2xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.15), rgba(255, 215, 0, 0.1))',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    boxShadow: '0 0 30px rgba(255, 105, 180, 0.1)',
                  }}
                >
                  <p className="text-xs text-pink-300 mb-1">Next Period: {prediction.period}</p>
                  <div
                    className="text-4xl font-black my-3"
                    style={{
                      background: prediction.predictedSize === 'Big'
                        ? 'linear-gradient(90deg, #ff4444, #ff8844)'
                        : 'linear-gradient(90deg, #44ff44, #44ffaa)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {prediction.predictedSize}
                  </div>
                  <div className="flex justify-center gap-2 mb-2">
                    {prediction.predictedNumbers.map((n, i) => (
                      <span
                        key={i}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{
                          background: n >= 5
                            ? 'linear-gradient(135deg, #ff4444, #ff8844)'
                            : 'linear-gradient(135deg, #44ff44, #44ffaa)',
                          color: '#fff',
                          boxShadow: `0 0 10px ${n >= 5 ? '#ff444480' : '#44ff4480'}`,
                        }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                  {/* Confidence bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-pink-300 mb-1">
                      <span>Confidence</span>
                      <span>{prediction.confidence}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${prediction.confidence}%`,
                          background: prediction.confidence >= 65
                            ? 'linear-gradient(90deg, #44ff44, #ffd700)'
                            : prediction.confidence >= 50
                              ? 'linear-gradient(90deg, #ffd700, #ff8844)'
                              : 'linear-gradient(90deg, #ff4444, #ff8844)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 215, 0, 0.15)',
                  }}
                >
                  <p className="text-xs text-yellow-300 font-medium mb-1">Analysis Reasoning:</p>
                  <p className="text-xs text-pink-200 leading-relaxed">
                    {prediction.reasoning}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)' }}
                  >
                    <p className="text-2xl font-bold text-red-400">{pattern.bigCount}</p>
                    <p className="text-xs text-red-300">Big (Last 20)</p>
                  </div>
                  <div className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(68, 255, 68, 0.1)', border: '1px solid rgba(68, 255, 68, 0.2)' }}
                  >
                    <p className="text-2xl font-bold text-green-400">{pattern.smallCount}</p>
                    <p className="text-xs text-green-300">Small (Last 20)</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Target size={48} className="mx-auto mb-3" color="#ff69b480" />
                <p className="text-pink-300 text-sm mb-2">No predictions yet</p>
                <p className="text-pink-400 text-xs">
                  Add at least 1 period result in the Data tab to start getting predictions.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {results.length > 0 ? (
              <>
                {/* Trend */}
                <div className="p-3 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 215, 0, 0.15)' }}
                >
                  <p className="text-xs text-yellow-300 font-medium mb-1">Current Trend</p>
                  <p className="text-sm text-pink-200">{pattern.recentTrend}</p>
                </div>

                {/* Streak */}
                {pattern.streakType && (
                  <div className="p-3 rounded-xl"
                    style={{
                      background: pattern.streakType === 'Big'
                        ? 'rgba(255, 68, 68, 0.1)'
                        : 'rgba(68, 255, 68, 0.1)',
                      border: `1px solid ${pattern.streakType === 'Big' ? 'rgba(255, 68, 68, 0.2)' : 'rgba(68, 255, 68, 0.2)'}`,
                    }}
                  >
                    <p className="text-xs text-yellow-300 font-medium mb-1">Active Streak</p>
                    <p className={`text-lg font-bold ${pattern.streakType === 'Big' ? 'text-red-400' : 'text-green-400'}`}>
                      {pattern.streakCount}x {pattern.streakType}
                    </p>
                  </div>
                )}

                {/* Hot Numbers */}
                <div className="p-3 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 105, 180, 0.15)' }}
                >
                  <p className="text-xs text-yellow-300 font-medium mb-2">Hot Numbers (Most Frequent)</p>
                  <div className="flex gap-2">
                    {pattern.hotNumbers.map((n, i) => (
                      <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #ff69b4, #ffd700)',
                          color: '#fff',
                        }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cold Numbers */}
                <div className="p-3 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(100, 100, 255, 0.15)' }}
                >
                  <p className="text-xs text-yellow-300 font-medium mb-2">Cold Numbers (Least Frequent)</p>
                  <div className="flex gap-2">
                    {pattern.coldNumbers.map((n, i) => (
                      <span key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: 'rgba(100, 100, 255, 0.3)',
                          color: '#aaa',
                          border: '1px solid rgba(100, 100, 255, 0.3)',
                        }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pattern Detection */}
                <div className="p-3 rounded-xl"
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 215, 0, 0.15)' }}
                >
                  <p className="text-xs text-yellow-300 font-medium mb-1">Pattern</p>
                  <p className="text-xs text-pink-200">
                    {pattern.alternatingPattern
                      ? 'Alternating Big/Small pattern detected - high predictability'
                      : pattern.streakCount >= 3
                        ? `${pattern.streakType} streak of ${pattern.streakCount} - reversal likely soon`
                        : 'No strong pattern - market is random'}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <BarChart3 size={48} className="mx-auto mb-3" color="#ff69b480" />
                <p className="text-pink-300 text-sm">No data to analyze</p>
                <p className="text-pink-400 text-xs mt-1">
                  Add results in the Data tab first.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Add result form */}
            <div className="p-3 rounded-xl space-y-2"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 215, 0, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Plus size={14} color="#ffd700" />
                <span className="text-xs font-medium text-yellow-300">Add Period Result</span>
              </div>
              <input
                type="text"
                value={manualPeriod}
                onChange={(e) => setManualPeriod(e.target.value)}
                placeholder={`Period (auto: ${currentPeriod})`}
                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffe0f0',
                  border: '1px solid rgba(255, 105, 180, 0.2)',
                }}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="9"
                  value={manualNumber}
                  onChange={(e) => setManualNumber(e.target.value)}
                  placeholder="Result (0-9)"
                  className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffe0f0',
                    border: '1px solid rgba(255, 105, 180, 0.2)',
                  }}
                />
                <button
                  onClick={handleAddManual}
                  disabled={!manualNumber || parseInt(manualNumber, 10) < 0 || parseInt(manualNumber, 10) > 9}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
                  style={{
                    background: manualNumber
                      ? 'linear-gradient(135deg, #ff69b4, #ffd700)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    opacity: manualNumber ? 1 : 0.5,
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Quick add buttons */}
            <div>
              <p className="text-xs text-pink-400 mb-2">Quick Add (Current Period):</p>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      const result: WingoResult = {
                        period: currentPeriod,
                        number: n,
                        size: n >= 5 ? 'Big' : 'Small',
                        color: n === 0 || n === 5 ? 'Violet' : n % 2 === 0 ? 'Red' : 'Green',
                        timestamp: Date.now(),
                      };
                      onAddResult(result);
                    }}
                    className="py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                    style={{
                      background: n >= 5
                        ? 'linear-gradient(135deg, rgba(255, 68, 68, 0.2), rgba(255, 136, 68, 0.2))'
                        : 'linear-gradient(135deg, rgba(68, 255, 68, 0.2), rgba(68, 255, 170, 0.2))',
                      color: n >= 5 ? '#ff8844' : '#44ffaa',
                      border: `1px solid ${n >= 5 ? 'rgba(255, 68, 68, 0.3)' : 'rgba(68, 255, 68, 0.3)'}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Results list */}
            <div>
              <p className="text-xs text-pink-400 mb-2">
                History ({results.length} results)
              </p>
              {sortedResults.length === 0 ? (
                <p className="text-center text-pink-400 text-xs py-4">No results yet</p>
              ) : (
                <div className="space-y-1.5">
                  {sortedResults.slice(0, 50).map((r) => (
                    <div
                      key={r.period + r.timestamp}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 105, 180, 0.1)',
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: colorMap[r.color] + '30',
                          color: colorMap[r.color],
                          border: `1px solid ${colorMap[r.color]}50`,
                        }}
                      >
                        {r.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-pink-200 truncate">P: {r.period}</p>
                      </div>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: r.size === 'Big'
                            ? 'rgba(255, 68, 68, 0.2)'
                            : 'rgba(68, 255, 68, 0.2)',
                          color: r.size === 'Big' ? '#ff8844' : '#44ffaa',
                        }}
                      >
                        {r.size}
                      </span>
                      <button
                        onClick={() => onDeleteResult(r.period)}
                        className="p-1"
                      >
                        <Trash2 size={12} color="#ff666680" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
