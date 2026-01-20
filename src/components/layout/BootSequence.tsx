import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_VERSION } from '../../config/version'; // ← バージョン情報を読み込み

interface Props {
  onComplete: () => void;
}

export const BootSequence: React.FC<Props> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 3.5秒後に消えるスイッチを入れる
    const timer = setTimeout(() => setIsVisible(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence 
      onExitComplete={() => onComplete()}
    >
      {isVisible && (
        <motion.div
          key="boot-sequence"
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1, 
            filter: "blur(20px)" 
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.22, 1, 0.36, 1] 
          }}
        >
          {/* ロゴ演出の中身 */}
          <div className="relative">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-900/30 rounded-full blur-[60px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 text-center"
            >
              <h1 className="text-5xl font-black text-white tracking-[0.2em] mb-2 font-sans">
                NISSAN
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className="h-[1px] w-8 bg-zinc-600"></span>
                <span className="text-xs text-zinc-400 tracking-[0.4em] uppercase">Intelligent Mobility</span>
                <span className="h-[1px] w-8 bg-zinc-600"></span>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-20 w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
              className="w-full h-full bg-white shadow-[0_0_10px_white]"
            />
          </div>

          {/* フッター部分：ここにバージョンを追加しました */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 flex flex-col items-center gap-2"
          >
            <div className="text-zinc-600 text-[10px] tracking-[0.3em]">
              SERENA LUXION
            </div>
            {/* バージョン表記 */}
            <div className="text-zinc-800 text-[9px] tracking-[0.1em] font-mono border border-zinc-900 px-2 py-0.5 rounded">
              v{APP_VERSION}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};