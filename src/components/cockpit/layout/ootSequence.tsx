import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

const checkList = [
  "SYSTEM INITIALIZING...",
  "CONNECTING TO SATELLITES...",
  "CHECKING SENSORS...",
  "LOADING MAP DATA...",
  "ESTABLISHING SECURE LINK...",
  "SERENA NAVI PRO IS READY."
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [currentText, setCurrentText] = useState(0);

  useEffect(() => {
    if (currentText >= checkList.length) {
      setTimeout(onComplete, 800); // 最後のメッセージの後、少し待って終了
      return;
    }

    const timer = setTimeout(() => {
      setCurrentText(prev => prev + 1);
    }, 400); // 0.4秒ごとにテキスト切り替え

    return () => clearTimeout(timer);
  }, [currentText, onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-center font-mono cursor-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-md px-8"
      >
        {/* Logo / Title */}
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter"
        >
          SERENA <span className="text-blue-500">NAVI</span> PRO
        </motion.h1>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-800 rounded-full mb-4 overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(((currentText + 1) / checkList.length) * 100, 100)}%` }}
            transition={{ ease: "linear" }}
          />
        </div>

        {/* System Text */}
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentText < checkList.length && (
              <motion.p
                key={currentText}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-blue-400 text-xs md:text-sm tracking-widest"
              >
                {checkList[currentText]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};