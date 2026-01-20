import React, { useRef, useState } from 'react';
import { useNavStore } from '../store/useNavStore';
import { MapWidget } from '../components/widgets/MapWidget';
import { NexcoWidget } from '../components/widgets/NexcoWidget';
import { TrafficTicker } from '../components/widgets/TrafficTicker';
import { HighwaySignWidget } from '../components/widgets/HighwaySignWidget';
import { WeatherWidget } from '../components/widgets/WeatherWidget';
import { InteractionOverlay } from '../components/cockpit/InteractionOverlay';
import { Navigation, Mic, ScanLine, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

export const CockpitPage: React.FC = () => {
  const { trafficInfo, nextWaypoint, currentSpeed, nearestFacilityText, addExpense } = useNavStore();
  const safeTrafficInfo = trafficInfo || { riskLevel: 0, jamDistance: 0, nextReg: '--' };
  
  // Voice Assistant Hook
  const { isListening, transcript, startListening } = useVoiceAssistant();

  // Vision Scan Logic
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 音声フィードバック用関数
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = "ja-JP";
    uttr.rate = 1.2;
    window.speechSynthesis.speak(uttr);
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    speak("画像を解析しています。前方を見てお待ちください。");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });
        
        const data = await res.json();
        
        if (data.title && data.amount) {
          // Driverモードなので、確認なしで即座にNaoto払いで登録
          addExpense(data.title, parseInt(data.amount), 'Naoto');
          speak(`${data.title}、${data.amount}円を登録しました。`);
        } else {
          speak("金額を読み取れませんでした。");
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      speak("エラーが発生しました。");
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 pb-24 overflow-y-auto md:overflow-hidden relative bg-cockpit-bg text-cockpit-text-primary font-sans">
      
      <InteractionOverlay />
      
      {/* メインエリア */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[50vh] md:h-[300px]">
        {/* 左側パネル (速度等) */}
        <div className="md:col-span-4 flex flex-col gap-4 md:justify-between order-2 md:order-1">
          <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl p-6 border border-cockpit-border text-center md:text-left shadow-lg">
            <div className="text-cockpit-text-muted text-xs font-bold uppercase tracking-wider mb-1 font-mono">Current Speed</div>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-7xl md:text-8xl font-black text-white tracking-tighter font-display">
                {currentSpeed}
              </span>
              <span className="text-xl text-cockpit-text-secondary font-bold">km/h</span>
            </div>
          </div>

          <div className="bg-cockpit-panel backdrop-blur-md rounded-xl p-4 border border-cockpit-border">
            <div className="flex items-center gap-2 text-cockpit-text-secondary mb-2">
              <Navigation size={16} />
              <span className="text-xs font-bold tracking-wider">NEXT WAYPOINT</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-white truncate">
              {nextWaypoint ? nextWaypoint.name : 'Destination Reached'}
            </div>
            <div className="text-sm text-cockpit-accent font-mono mt-1">
              {nearestFacilityText}
            </div>
          </div>
        </div>

        {/* 地図エリア */}
        <div className="md:col-span-8 relative h-[300px] md:h-auto order-1 md:order-2 rounded-2xl overflow-hidden shadow-2xl border border-cockpit-border bg-black">
          <MapWidget />
          <div className="absolute top-4 right-4 w-auto md:w-64 z-10">
            <NexcoWidget 
              riskLevel={safeTrafficInfo.riskLevel} 
              jamDistance={safeTrafficInfo.jamDistance} 
              nextReg={safeTrafficInfo.nextReg} 
            />
          </div>
          <div className="absolute top-4 left-4 z-10 hidden md:block">
            <HighwaySignWidget />
          </div>
        </div>
      </div>

      {/* 下部パネル: Command Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-[200px]">
        
        {/* Voice & Vision Command Panel (2分割) */}
        <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl border border-cockpit-border flex overflow-hidden relative">
          
          {/* Left: Voice Assistant */}
          <button 
            onClick={startListening}
            className={`flex-1 flex flex-col items-center justify-center gap-2 border-r border-zinc-700/50 hover:bg-white/5 transition-all ${isListening ? 'bg-red-900/30' : ''}`}
          >
            <Mic size={28} className={isListening ? "text-red-500 animate-pulse" : "text-white"} />
            <span className="text-[10px] font-bold text-zinc-400 tracking-widest">VOICE</span>
            {isListening && transcript && (
              <span className="absolute bottom-2 text-[10px] text-white bg-black/50 px-2 rounded truncate max-w-full">
                {transcript}
              </span>
            )}
          </button>

          {/* Right: Vision Scan */}
          <div className="flex-1 relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              capture="environment" 
              onChange={handleScan} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all ${isScanning ? 'bg-green-900/30' : ''}`}
            >
              {isScanning ? (
                <Loader2 size={28} className="text-green-500 animate-spin" />
              ) : (
                <ScanLine size={28} className="text-green-400" />
              )}
              <span className="text-[10px] font-bold text-zinc-400 tracking-widest">
                {isScanning ? "ANALYZING..." : "SCAN RECEIPT"}
              </span>
            </button>
          </div>
        </div>

        {/* Energy Monitor */}
        <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl p-4 border border-cockpit-border flex flex-col justify-between gap-2">
          <div className="text-cockpit-text-muted text-xs font-bold">ENERGY FLOW</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white font-display">4.2</span>
            <span className="text-sm text-cockpit-text-secondary mb-1">km/kWh</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '65%' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            />
          </div>
        </div>

        <WeatherWidget />
      </div>

      <TrafficTicker />
    </div>
  );
};