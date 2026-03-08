import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraOff, Upload, X, Eye } from 'lucide-react';

interface CameraVisionProps {
  language: 'bn' | 'en';
  onAnalyzeImage: (imageData: string, question?: string) => void;
}

const CameraVision = ({ language, onAnalyzeImage }: CameraVisionProps) => {
  const [cameraOn, setCameraOn] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = useCallback((bn: string, en: string) => language === 'bn' ? bn : en, [language]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch (err) {
      console.error('Camera access denied', err);
      alert(t('ক্যামেরা অ্যাক্সেস দেওয়া হয়নি', 'Camera access denied'));
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setUploadedImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!uploadedImage) return;
    setAnalyzing(true);
    onAnalyzeImage(uploadedImage, question);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: '#00ffff', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}
      >
        {t('লাইভ ভিশন ও ইমেজ এনালাইসিস', 'Live Vision & Image Analysis')}
      </h2>

      {/* Camera Controls */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,255,255,0.2)',
        }}
      >
        <div className="flex gap-3 mb-4">
          <button
            onClick={cameraOn ? stopCamera : startCamera}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer border-0"
            style={{
              background: cameraOn ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,255,0.1)',
              border: `1px solid ${cameraOn ? 'rgba(255,0,0,0.4)' : 'rgba(0,255,255,0.3)'}`,
              color: cameraOn ? '#ff4444' : '#00ffff',
              transition: 'all 0.3s',
            }}
          >
            {cameraOn ? <CameraOff size={18} /> : <Camera size={18} />}
            {cameraOn ? t('ক্যামেরা বন্ধ', 'Camera OFF') : t('ক্যামেরা চালু', 'Camera ON')}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer border-0"
            style={{
              background: 'rgba(0,255,255,0.1)',
              border: '1px solid rgba(0,255,255,0.3)',
              color: '#00ffff',
              transition: 'all 0.3s',
            }}
          >
            <Upload size={18} />
            {t('ছবি আপলোড', 'Upload Image')}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

          {cameraOn && (
            <button
              onClick={captureFrame}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer border-0"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
                color: '#000',
                transition: 'all 0.3s',
              }}
            >
              <Eye size={18} />
              {t('ক্যাপচার', 'Capture')}
            </button>
          )}
        </div>

        {/* Video Feed */}
        {cameraOn && (
          <div className="relative rounded-xl overflow-hidden mb-4" style={{ border: '2px solid rgba(0,255,255,0.3)' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
            {/* Scan overlay */}
            <div
              className="absolute left-0 w-full"
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
                boxShadow: '0 0 10px #00ffff',
                animation: 'scan-line 3s linear infinite',
                top: '0',
              }}
            />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Uploaded/Captured Image Preview */}
        {uploadedImage && (
          <div className="relative rounded-xl overflow-hidden mb-4" style={{ border: '2px solid rgba(0,255,255,0.3)' }}>
            <img src={uploadedImage} alt="Captured" className="w-full" style={{ maxHeight: '300px', objectFit: 'contain' }} />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute top-2 right-2 p-1 rounded-full cursor-pointer border-0"
              style={{ background: 'rgba(0,0,0,0.7)', color: '#ff4444' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Question Input */}
        {uploadedImage && (
          <div className="space-y-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder={t('এটি কী? এটি কীভাবে কাজ করে?', 'What is this? How does it work?')}
              className="w-full"
              style={{
                background: 'rgba(0,0,0,0.7)',
                border: '2px solid rgba(0,255,255,0.3)',
                color: '#00ffff',
                padding: '12px 16px',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
              }}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-3 rounded-xl font-bold text-black text-sm cursor-pointer border-0"
              style={{
                background: analyzing ? '#666' : 'linear-gradient(135deg, #ffd700, #ffaa00)',
                boxShadow: analyzing ? 'none' : '0 0 15px rgba(255,215,0,0.3)',
                transition: 'all 0.3s',
              }}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-black border-t-transparent" style={{ animation: 'rotate-border 0.8s linear infinite' }} />
                  {t('বিশ্লেষণ হচ্ছে...', 'Analyzing...')}
                </span>
              ) : (
                t('বিশ্লেষণ করুন', 'Analyze Image')
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(0,255,255,0.1)',
        }}
      >
        <h3 className="text-cyan-300 text-sm font-bold mb-2">{t('ক্ষমতা', 'Capabilities')}</h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• {t('রিয়েল-টাইম অবজেক্ট ডিটেকশন', 'Real-time object detection')}</li>
          <li>• {t('ইমেজ থেকে টেক্সট রিড (OCR)', 'Text reading from images (OCR)')}</li>
          <li>• {t('বস্তু চিনতে পারা ও বর্ণনা', 'Object recognition & description')}</li>
          <li>• {t('স্ক্রিনশট থেকে ডেটা এক্সট্রাকশন', 'Data extraction from screenshots')}</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraVision;
