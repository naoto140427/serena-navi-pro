import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Info, AlertTriangle } from 'lucide-react'; // Bellを削除
import { useNavStore } from '../../store/useNavStore';

export const DynamicIsland: React.FC = () => {
  const { activeNotification, clearNotification } = useNavStore();

  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification, clearNotification]);

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999]">
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ width: 40, height: 40, borderRadius: 20, opacity: 0 }}
            animate={{ width: 'auto', height: 48, borderRadius: 24, opacity: 1 }}
            exit={{ width: 40, height: 40, opacity: 0, scale: 0.5 }}
            className="bg-black border border-zinc-800 shadow-2xl flex items-center overflow-hidden px-1"
          >
            <div className="flex items-center gap-3 px-3 min-w-[200px] whitespace-nowrap">
              <div className="text-yellow-400">
                {activeNotification.type === 'rest' ? <Coffee size={20} /> :
                 activeNotification.type === 'warning' ? <AlertTriangle size={20} /> :
                 <Info size={20} />}
              </div>
              
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">
                  {activeNotification.sender || 'System'}
                </span>
                <span className="text-sm font-bold text-white">
                  {activeNotification.message}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!activeNotification && (
        <div className="w-24 h-7 bg-black rounded-full border border-zinc-900 shadow-lg mx-auto transition-all duration-500 hover:w-32 hover:border-zinc-700" />
      )}
    </div>
  );
};