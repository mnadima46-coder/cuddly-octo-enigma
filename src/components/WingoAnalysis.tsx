import { useState, useCallback } from 'react';

interface WingoResult {
  period: string;
  number: number;
  size: 'Big' | 'Small';
  color: 'Red' | 'Green' | 'Violet';
}

interface Prediction {
  nextSize: string;
  nextColor: string;
  nextNumber: string;
  confidence: number;
  pattern: string;
  explanation: string;
}

interface WingoAnalysisProps {
  language: 'bn' | 'en';
}

const WingoAnalysis = ({ language }: WingoAnalysisProps) => {
  const [history, setHistory] = useState<WingoResult[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  const t = useCallback((bn: string, en: string) => language === 'bn' ? bn : en, [language]);

  const getColor = (num: number): 'Red' | 'Green' | 'Violet' => {
    if (num === 0) return 'Violet'; // Red+Violet
    if (num === 5) return 'Violet'; // Green+Violet
    if ([1, 3, 7, 9].includes(num)) return 'Green';
    return 'Red'; // 2, 4, 6, 8
  };

  const getSize = (num: number): 'Big' | 'Small' => num >= 5 ? 'Big' : 'Small';

  const addResult = () => {
    const nums = manualInput.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n) && n >= 0 && n <= 9);
    if (nums.length === 0) return;

    const newResults: WingoResult[] = nums.map((num, i) => ({
      period: `P${(history.length + i + 1).toString().padStart(3, '0')}`,
      number: num,
      size: getSize(num),
      color: getColor(num),
    }));

    const updated = [...history, ...newResults].slice(-20);
    setHistory(updated);
    setManualInput('');

    if (updated.length >= 3) {
      analyzePrediction(updated);
    }
  };

  const analyzePrediction = (data: WingoResult[]) => {
    const last10 = data.slice(-10);
    const last3 = data.slice(-3);

    // Pattern Detection
    let patternName = '';
    let explanation = '';
    let predictedSize = '';
    let predictedColor = '';
    let predictedNum = '';
    let confidence = 60;

    // 1. Dragon Pattern: consecutive same size 5+
    const sizes = last10.map((r) => r.size);
    let consecutiveCount = 1;
    for (let i = sizes.length - 1; i > 0; i--) {
      if (sizes[i] === sizes[i - 1]) consecutiveCount++;
      else break;
    }

    if (consecutiveCount >= 5) {
      patternName = 'Long Dragon';
      predictedSize = sizes[sizes.length - 1];
      confidence = 75 + Math.min(consecutiveCount * 2, 15);
      explanation = language === 'bn'
        ? `টানা ${consecutiveCount} বার ${predictedSize} এসেছে। ড্রাগন প্যাটার্ন চলছে - ব্রেক না হওয়া পর্যন্ত একই দিকে থাকুন।`
        : `${consecutiveCount} consecutive ${predictedSize}. Dragon pattern active - stay on the same side until break.`;
    }
    // 2. Mirror/Alternative Pattern: B-S-B-S
    else if (last10.length >= 4) {
      const lastFour = sizes.slice(-4);
      const isAlternating = lastFour.every((s, i) => i === 0 || s !== lastFour[i - 1]);
      if (isAlternating) {
        patternName = 'Mirror Pattern';
        predictedSize = sizes[sizes.length - 1] === 'Big' ? 'Small' : 'Big';
        confidence = 70;
        explanation = language === 'bn'
          ? `মিরর/অল্টারনেটিভ প্যাটার্ন সক্রিয়। পর্যায়ক্রমিক Big-Small চলছে।`
          : `Mirror/Alternative pattern active. Alternating Big-Small sequence detected.`;
      }
    }

    // 3. Double Repeat: BB-SS-BB
    if (!patternName && last10.length >= 4) {
      const lastSix = sizes.slice(-6);
      let isDouble = true;
      for (let i = 0; i < lastSix.length - 1; i += 2) {
        if (lastSix[i] !== lastSix[i + 1]) { isDouble = false; break; }
      }
      if (isDouble && lastSix.length >= 4) {
        patternName = '2-2 Pattern';
        const currentPair = sizes[sizes.length - 1];
        const pairCount = sizes.slice(-2).filter((s) => s === currentPair).length;
        predictedSize = pairCount >= 2 ? (currentPair === 'Big' ? 'Small' : 'Big') : currentPair;
        confidence = 68;
        explanation = language === 'bn'
          ? `২-২ প্যাটার্ন শনাক্ত। দুইবার Big এবং দুইবার Small পর্যায়ক্রমে আসছে।`
          : `2-2 pattern detected. Double repeat Big-Small sequence.`;
      }
    }

    // 4. Twin Logic
    if (!patternName && last3.length >= 2) {
      const lastTwo = last3.slice(-2);
      if (lastTwo[0].number === lastTwo[1].number) {
        patternName = 'Twin Pattern';
        predictedSize = lastTwo[0].size;
        confidence = 78;
        explanation = language === 'bn'
          ? `যমজ নম্বর ${lastTwo[0].number} শনাক্ত। বর্তমান ${predictedSize} ট্রেন্ড শক্তিশালী (৮০% সম্ভাবনা)।`
          : `Twin number ${lastTwo[0].number} detected. Current ${predictedSize} trend strengthened (~80% probability).`;
      }
    }

    // 5. Single Break Pattern
    if (!patternName && last10.length >= 5) {
      const lastFive = sizes.slice(-5);
      if (lastFive[0] === lastFive[1] && lastFive[1] === lastFive[2] &&
          lastFive[2] !== lastFive[3] && lastFive[3] !== lastFive[4]) {
        patternName = 'Single Break';
        predictedSize = lastFive[2]; // back to original trend
        confidence = 72;
        explanation = language === 'bn'
          ? `সিঙ্গেল ব্রেক প্যাটার্ন। ৩টি ${lastFive[0]} এর পর ১টি ব্রেক - ট্রেন্ড কন্টিনিউয়েশন প্রত্যাশিত।`
          : `Single Break pattern. After 3x ${lastFive[0]} + 1 break - trend continuation expected.`;
      }
    }

    // Last Digit Calculation fallback
    if (!patternName) {
      const sum = last3.reduce((acc, r) => acc + r.number, 0);
      const lastDigit = sum % 10;
      predictedSize = lastDigit >= 5 ? 'Big' : 'Small';
      patternName = 'Last Digit Sum';
      confidence = 62;
      explanation = language === 'bn'
        ? `শেষ ৩ পিরিয়ডের যোগফল: ${last3.map((r) => r.number).join(' + ')} = ${sum}। শেষ ডিজিট ${lastDigit} → ${predictedSize} প্রত্যাশিত।`
        : `Last 3 periods sum: ${last3.map((r) => r.number).join(' + ')} = ${sum}. Last digit ${lastDigit} → ${predictedSize} expected.`;
    }

    // Color prediction
    const colors = last10.map((r) => r.color);
    const lastNum = last3[last3.length - 1]?.number;
    let colorConsecutive = 1;
    for (let i = colors.length - 1; i > 0; i--) {
      if (colors[i] === colors[i - 1]) colorConsecutive++;
      else break;
    }

    if (lastNum === 0) {
      predictedColor = 'Red';
    } else if (lastNum === 5) {
      predictedColor = 'Green';
    } else if (colorConsecutive >= 3) {
      predictedColor = colors[colors.length - 1];
    } else {
      predictedColor = predictedSize === 'Big' ? 'Green' : 'Red';
    }

    // Number prediction: neighbor logic + sum
    const sum3 = last3.reduce((acc, r) => acc + r.number, 0) % 10;
    const neighbors = [
      Math.max(0, lastNum - 2),
      Math.max(0, lastNum - 1),
      Math.min(9, lastNum + 1),
      Math.min(9, lastNum + 2),
    ];
    const candidateNums = neighbors.filter((n) => getSize(n) === predictedSize);
    predictedNum = candidateNums.length > 0
      ? candidateNums.join(` ${t('বা', 'or')} `)
      : `${sum3}`;

    const pred: Prediction = {
      nextSize: predictedSize,
      nextColor: predictedColor,
      nextNumber: predictedNum,
      confidence,
      pattern: patternName,
      explanation,
    };

    setPrediction(pred);
    setShowPrediction(true);
  };

  const getColorBg = (color: string) => {
    switch (color) {
      case 'Red': return 'bg-red-500';
      case 'Green': return 'bg-green-500';
      case 'Violet': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}
      >
        {t('উইনগো মার্কেট এনালাইসিস', 'Wingo Market Analysis')}
      </h2>

      {/* Input Section */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,255,255,0.2)',
        }}
      >
        <p className="text-cyan-300 text-sm mb-3">
          {t('গত রেজাল্ট নম্বর কমা দিয়ে লিখুন (যেমন: 3,7,2,8,1):', 'Enter past result numbers comma-separated (e.g.: 3,7,2,8,1):')}
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addResult()}
            placeholder={t('নম্বর লিখুন...', 'Enter numbers...')}
            className="flex-1 text-sm"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '2px solid rgba(0,255,255,0.3)',
              color: '#00ffff',
              padding: '10px 16px',
              borderRadius: '10px',
              outline: 'none',
            }}
          />
          <button
            onClick={addResult}
            className="px-6 py-2 rounded-xl font-bold text-black text-sm border-0 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
              boxShadow: '0 0 10px rgba(255,215,0,0.3)',
              transition: 'all 0.3s',
            }}
          >
            {t('বিশ্লেষণ', 'Analyze')}
          </button>
        </div>
      </div>

      {/* History Table */}
      {history.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-6 overflow-x-auto"
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,255,255,0.15)',
          }}
        >
          <h3 className="text-cyan-300 text-sm font-bold mb-3">
            {t('হিস্ট্রি রেকর্ড', 'History Record')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {history.map((r, i) => (
              <div
                key={i}
                className="flex flex-col items-center p-2 rounded-lg"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(0,255,255,0.1)',
                  minWidth: '52px',
                }}
              >
                <span className="text-gray-400 text-xs">{r.period}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm my-1 ${getColorBg(r.color)}`}
                >
                  {r.number}
                </div>
                <span className={`text-xs font-bold ${r.size === 'Big' ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {r.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prediction Result */}
      {showPrediction && prediction && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(0,255,255,0.3)',
            boxShadow: '0 0 30px rgba(0,255,255,0.1)',
            animation: 'fadeIn 0.5s ease-out',
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
            {t('প্রেডিকশন রেজাল্ট', 'Prediction Result')}
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)' }}>
              <p className="text-gray-400 text-xs mb-1">{t('সাইজ', 'Size')}</p>
              <p className={`text-2xl font-bold ${prediction.nextSize === 'Big' ? 'text-yellow-400' : 'text-blue-400'}`}>
                {prediction.nextSize}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)' }}>
              <p className="text-gray-400 text-xs mb-1">{t('কালার', 'Color')}</p>
              <p className={`text-2xl font-bold ${prediction.nextColor === 'Red' ? 'text-red-400' : prediction.nextColor === 'Green' ? 'text-green-400' : 'text-purple-400'}`}>
                {prediction.nextColor}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)' }}>
              <p className="text-gray-400 text-xs mb-1">{t('নম্বর', 'Number')}</p>
              <p className="text-2xl font-bold text-cyan-300">{prediction.nextNumber}</p>
            </div>
          </div>

          {/* Pattern & Confidence */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-cyan-300">{t('প্যাটার্ন:', 'Pattern:')} <span className="text-white font-bold">{prediction.pattern}</span></span>
            <span className="text-sm text-cyan-300">
              {t('আত্মবিশ্বাস:', 'Confidence:')}
              <span className="text-yellow-400 font-bold ml-1">{prediction.confidence}%</span>
            </span>
          </div>

          {/* Confidence Bar */}
          <div className="w-full h-2 rounded-full mb-4" style={{ background: 'rgba(0,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${prediction.confidence}%`,
                background: `linear-gradient(90deg, #00ffff, ${prediction.confidence > 75 ? '#00ff64' : '#ffd700'})`,
                boxShadow: `0 0 10px ${prediction.confidence > 75 ? '#00ff64' : '#ffd700'}66`,
              }}
            />
          </div>

          {/* Explanation */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.1)' }}>
            <p className="text-sm text-gray-300 leading-relaxed">
              {prediction.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Pattern Guide Table */}
      <div
        className="rounded-2xl p-4 mt-6"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,255,255,0.1)',
        }}
      >
        <h3 className="text-cyan-300 text-sm font-bold mb-3">{t('প্যাটার্ন গাইড', 'Pattern Guide')}</h3>
        <div className="space-y-2">
          {[
            { name: 'Long Dragon', desc: language === 'bn' ? 'টানা একই সাইড আসা' : 'Consecutive same side', tip: language === 'bn' ? 'ব্রেক না হওয়া পর্যন্ত একই দিকে' : 'Stay same side until break' },
            { name: 'Mirror', desc: language === 'bn' ? 'পর্যায়ক্রমিক Big-Small' : 'Alternating Big-Small', tip: language === 'bn' ? 'বিপরীত দিকে যান' : 'Go opposite' },
            { name: '2-2 Pattern', desc: language === 'bn' ? 'দুইবার করে পুনরাবৃত্তি' : 'Double repeat', tip: language === 'bn' ? 'জোড়া শেষে পরিবর্তন' : 'Change after pair ends' },
            { name: 'Twin', desc: language === 'bn' ? 'একই নম্বর পরপর' : 'Same number twice', tip: language === 'bn' ? 'ট্রেন্ড শক্তিশালী, একই দিকে' : 'Trend strong, stay same' },
            { name: 'Single Break', desc: language === 'bn' ? '৩+১ ব্রেক+ট্রেন্ড' : '3+1 break+trend', tip: language === 'bn' ? 'ট্রেন্ড কন্টিনিউয়েশন' : 'Trend continuation' },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(0,255,255,0.03)' }}>
              <span className="text-cyan-400 font-bold text-xs w-24 flex-shrink-0">{p.name}</span>
              <span className="text-gray-400 text-xs flex-1">{p.desc}</span>
              <span className="text-yellow-400 text-xs flex-shrink-0">{p.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WingoAnalysis;
