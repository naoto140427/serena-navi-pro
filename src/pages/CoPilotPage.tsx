import React from 'react';
import { useNavStore } from '../store/useNavStore';
import { Coffee, Music, MapPin } from 'lucide-react';

export const CoPilotPage: React.FC = () => {
  const { sendNotification, currentUser } = useNavStore();

  const handleSend = (type: 'rest' | 'music' | 'info', msg: string) => {
    sendNotification({
      id: crypto.randomUUID(), // ランダムID生成
      type,
      message: msg,
      sender: currentUser || "Co-Pilot",
      payload: { timestamp: Date.now() }
    });
  };

  return (
    <div className="p-6 pb-24 min-h-screen bg-black text-white space-y-6 font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Co-Pilot Console
        </h1>
        <p className="text-zinc-500 text-sm">Target: SERENA-001 (Naoto)</p>
      </header>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        <button 
          onClick={() => handleSend('rest', 'SAで休憩したいです')}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-zinc-800 hover:border-green-500/50"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
            <Coffee size={24} />
          </div>
          <span className="font-bold text-sm">休憩提案</span>
        </button>

        <button 
          onClick={() => handleSend('music', 'テンション上がる曲！')}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-zinc-800 hover:border-pink-500/50"
        >
          <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Music size={24} />
          </div>
          <span className="font-bold text-sm">音楽リクエスト</span>
        </button>

        <button 
          onClick={() => handleSend('info', '次の目的地をセット')}
          className="col-span-2 bg-blue-600 p-4 rounded-xl font-bold shadow-lg shadow-blue-900/50 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <MapPin size={20} />
          目的地を送信 (Demo)
        </button>
      </div>

      <div className="text-center text-xs text-zinc-600 mt-10">
        Connected via Firebase Realtime Database
      </div>
    </div>
  );
};