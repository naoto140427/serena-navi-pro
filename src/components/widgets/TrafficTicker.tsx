import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TrafficData = {
  status: 'green' | 'yellow' | 'red';
  messages: string[];
};

export const TrafficTicker: React.FC = () => {
  const [data, setData] = useState<TrafficData | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  // 起動時と、その後5分おきに情報を更新
  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const res = await fetch('/api/traffic');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Traffic API Error");
      }
    };

    fetchTraffic();
    const interval = setInterval(fetchTraffic, 5 * 60 * 1000); // 5分更新
    return () => clearInterval(interval);
  }, []);

  // メッセージを5秒ごとに切り替える
  useEffect(() => {
    if (!data || data.messages.length <= 1) return;
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % data.messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [data]);

  if (!data) return null;

  const isAlert = data.status === 'red';
  const bgColor = isAlert ? 'bg-red-900/80 border-red-500/50' : 'bg-zinc-900/80 border-zinc-700';
  const textColor = isAlert ? 'text-red-100' : 'text-zinc-300';
  const Icon = isAlert ? AlertTriangle : CheckCircle;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md p-3 ${bgColor} ${textColor}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        
        {/* ラベル部分 */}
        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full shrink-0">
          <Radio size={14} className={isAlert ? "animate-pulse text-red-500" : "text-green-500"} />
          <span className="text-xs font-bold tracking-wider">TRAFFIC LIVE</span>
        </div>

        {/* 流れるメッセージ部分 */}
        <div className="flex-1 overflow-hidden relative h-6">
          <AnimatePresence mode='wait'>
            <motion.div
              key={msgIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute inset-0 flex items-center gap-2"
            >
              <Icon size={18} />
              <span className="font-bold text-sm md:text-base truncate">
                {data.messages[msgIndex]}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 件数表示 */}
        {data.messages.length > 1 && (
          <div className="text-xs font-mono opacity-50 shrink-0">
            {msgIndex + 1} / {data.messages.length}
          </div>
        )}
      </div>
    </div>
  );
};