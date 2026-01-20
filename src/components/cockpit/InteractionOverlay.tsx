import React, { useEffect } from 'react';
import { useNavStore } from '../../store/useNavStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Coffee, Info, MapPin } from 'lucide-react'; // Bellを削除
import { soundManager } from '../../utils/SoundManager';

export const InteractionOverlay: React.FC = () => {
  const { activeNotification, clearNotification, mode } = useNavStore();

  useEffect(() => {
    if (activeNotification) {
      // 通知音を鳴らす (SoundManagerにこのメソッドを追加します)
      soundManager.playNotification();

      // 自動読み上げ (Cockpitモードのみ)
      if (mode === 'driver') {
        const textToRead = activeNotification.payload?.tts || activeNotification.message;
        
        window.speechSynthesis.cancel();
        const uttr = new SpeechSynthesisUtterance(textToRead);
        uttr.lang = "ja-JP";
        uttr.rate = 1.1;
        
        setTimeout(() => {
          window.speechSynthesis.speak(uttr);
        }, 1000);
      }

      const timer = setTimeout(() => {
        clearNotification();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification, clearNotification, mode]);

  return (
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="absolute top-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-lg w-full pointer-events-auto ring-1 ring-white/20">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              activeNotification.type === 'rest' ? 'bg-orange-500/20 text-orange-400' :
              activeNotification.type === 'music' ? 'bg-pink-500/20 text-pink-400' :
              activeNotification.sender === 'Serena AI' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {activeNotification.type === 'rest' && <Coffee size={24} />}
              {activeNotification.type === 'music' && <Music size={24} />}
              {activeNotification.sender === 'Serena AI' ? <MapPin size={24} /> : activeNotification.type === 'info' && <Info size={24} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  INCOMING REQUEST
                </span>
                <span className="text-[10px] font-bold text-zinc-500">
                  FROM: {activeNotification.sender}
                </span>
              </div>
              <p className="font-bold text-lg leading-tight truncate">
                {activeNotification.message}
              </p>
              {activeNotification.payload?.tts && (
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {activeNotification.payload.tts}
                </p>
              )}
            </div>

            <button 
              onClick={clearNotification}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <div className="text-xs font-bold text-zinc-500">DISMISS</div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};