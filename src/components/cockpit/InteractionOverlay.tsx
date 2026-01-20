import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavStore } from '../../store/useNavStore';
import { Navigation, Music, Info, Check, X } from 'lucide-react';

export const InteractionOverlay: React.FC = () => {
  // ★修正: 使っていない setNextWaypoint を削除しました
  const { activeNotification, clearNotification } = useNavStore();

  // 8秒後に自動で消えるタイマー
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification, clearNotification]);

  const handleAccept = () => {
    // 将来的にここに「目的地セット」などのロジックを追加します
    console.log("Accepted notification:", activeNotification);
    clearNotification();
  };

  return (
    <div className="absolute top-0 left-0 w-full flex justify-center z-50 pointer-events-none pt-4">
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            key={activeNotification.id}
            initial={{ y: -150, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -150, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto"
          >
            {/* Glassmorphism Card */}
            <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-3 pr-5 shadow-2xl flex items-center gap-4 min-w-[380px] max-w-[90vw]">
              
              {/* Icon / Avatar Area */}
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  activeNotification.type === 'rest' ? 'bg-orange-500/20 text-orange-400' :
                  activeNotification.type === 'music' ? 'bg-pink-500/20 text-pink-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {activeNotification.type === 'rest' && <Navigation size={28} />}
                  {activeNotification.type === 'music' && <Music size={28} />}
                  {activeNotification.type === 'info' && <Info size={28} />}
                  {activeNotification.type === 'warning' && <Info size={28} />}
                </div>
                {/* Ping Animation */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </div>

              {/* Text Content */}
              <div className="flex-1 text-left">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  REQUEST FROM {activeNotification.sender || "CO-PILOT"}
                </p>
                <p className="text-white font-bold text-lg leading-tight">
                  {activeNotification.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-l border-white/10 pl-4">
                <button 
                  onClick={handleAccept}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                >
                  <Check size={20} strokeWidth={3} />
                </button>
                <button 
                  onClick={clearNotification}
                  className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};