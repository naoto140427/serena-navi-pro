import React, { useState } from 'react';
import { useNavStore } from '../store/useNavStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Utensils, Camera, MapPin, Navigation, Info, X, Zap, ShoppingBag, Wind, Flag } from 'lucide-react'; // Music削除

export const PassengerHub: React.FC = () => {
  const { currentUser, nextWaypoint, currentAreaText, nearestFacilityText, todaysGoalText, nextWaypointEta, sendNotification } = useNavStore();
  const isKousuke = currentUser?.includes('Kousuke');
  const [showDetail, setShowDetail] = useState(false);

  // 引数 icon を削除しました（使っていなかったので）
  const sendRequest = (label: string) => {
    sendNotification({
      id: Date.now().toString(),
      type: 'rest',
      message: `${label}に行きたい`,
      sender: currentUser?.split(' ')[0] || 'Passenger'
    });
  };

  // 〜〜 中略（リストデータなどは変更なし） 〜〜
  const day2Highlights = isKousuke ? [
    { title: '伊勢うどん', desc: '山口屋 - ふわふわの極太麺', type: 'Lunch', time: '伊勢市' },
    { title: '赤福本店', desc: '五十鈴川を見ながらお茶', type: 'Sweet', time: 'おかげ横丁' },
    { title: '松阪牛串', desc: '食べ歩きの定番', type: 'Snack', time: 'おかげ横丁' },
  ] : [
    { title: '夫婦岩', desc: '二見興玉神社 - 日の出の名所', type: 'Spot', time: '二見' },
    { title: '鳥羽展望台', desc: 'パールロード - 地平線が見える', type: 'View', time: '鳥羽' },
    { title: '神宮杉', desc: '内宮 - パワースポット', type: 'Nature', time: '内宮' },
  ];

  const day3Highlights = isKousuke ? [
    { title: '神戸牛コロッケ', desc: '三木SA - 関西最後の味', type: 'Snack', time: '兵庫' },
    { title: '尾道ラーメン', desc: '小谷SA - 瀬戸内の味', type: 'Lunch', time: '広島' },
    { title: '美東ちゃんぽん', desc: '美東SA - 帰りの定番夕食', type: 'Dinner', time: '山口' },
  ] : [
    { title: '明石海峡大橋', desc: '淡路SA - 世界最長の吊橋', type: 'View', time: '兵庫' },
    { title: '壇之浦の夜景', desc: '関門橋 - 九州への帰還', type: 'Night', time: '山口' },
    { title: '別府湾の灯り', desc: '最後の休憩スポット', type: 'View', time: '大分' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 font-sans relative overflow-hidden">
      
      <div className="pt-8 px-6 pb-4 bg-gradient-to-b from-zinc-900 to-transparent">
        <div className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
          <MapPin size={12} /> CURRENT LOCATION
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {currentAreaText}
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Navigation size={12} className="text-zinc-500" />
              <div className="text-[10px] text-zinc-500 font-bold uppercase">NEXT STOP</div>
            </div>
            <div className="text-sm text-zinc-300 font-medium truncate">{nearestFacilityText}</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Flag size={12} className="text-red-500" />
              <div className="text-[10px] text-zinc-500 font-bold uppercase">FINAL DEST</div>
            </div>
            <div className="text-sm text-white font-bold truncate">{todaysGoalText}</div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" /> QUICK REQUESTS
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton 
              icon={Coffee} label="トイレ休憩" subLabel="Restroom" color="text-orange-400" 
              onClick={() => sendRequest('トイレ休憩')} // 引数を1つにしました
            />
            <ActionButton 
              icon={Wind} label="タバコ休憩" subLabel="Smoke" color="text-zinc-400" 
              onClick={() => sendRequest('タバコ休憩')} // 引数を1つにしました
            />
            <ActionButton 
              icon={ShoppingBag} label="コンビニ" subLabel="Store" color="text-blue-400" 
              onClick={() => sendRequest('コンビニ')} // 引数を1つにしました
            />
            <ActionButton 
              icon={Camera} label="写真タイム" subLabel="Photo" color="text-purple-400" 
              onClick={() => sendRequest('写真タイム')} // 引数を1つにしました
            />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
              <Info size={16} className="text-blue-400" /> NEXT PLANNED STOP
            </h2>
          </div>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDetail(true)}
            className="bg-gradient-to-br from-blue-900/20 to-zinc-900 rounded-2xl p-5 shadow-lg border border-blue-500/30 relative overflow-hidden cursor-pointer group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <Info size={20} className="text-blue-400" />
            </div>
            <div className="mb-4">
              <h3 className="text-3xl font-bold text-white mb-1">{nextWaypoint?.name || 'Searching...'}</h3>
              <p className="text-blue-200 text-sm font-medium flex items-center gap-2">
                <span className="bg-blue-600 px-2 py-0.5 rounded text-[10px]">ETA</span>
                <span className="font-mono text-lg font-bold">{nextWaypointEta}</span>
                <span className="text-xs opacity-70">到着予定</span>
              </p>
            </div>
          </motion.div>
        </section>

        <section className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded">DAY 2</span>
               <h2 className="text-sm font-bold text-zinc-400">Ise Sightseeing</h2>
            </div>
            <div className="grid gap-2">
              {day2Highlights.map((item, i) => (
                <ItemCard key={i} item={item} icon={isKousuke ? '🍜' : '⛩️'} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
               <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded">DAY 3</span>
               <h2 className="text-sm font-bold text-zinc-400">Return Trip</h2>
            </div>
            <div className="grid gap-2">
              {day3Highlights.map((item, i) => (
                <ItemCard key={i} item={item} icon={isKousuke ? '🍖' : '🌉'} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showDetail && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-6 pt-12 flex flex-col"
          >
            <button 
              onClick={() => setShowDetail(false)}
              className="absolute top-6 right-6 p-2 bg-zinc-800 rounded-full text-white"
            >
              <X size={20} />
            </button>
            <div className="flex-1 overflow-y-auto">
              <div className="text-center mb-8">
                <div className="text-xs text-blue-400 font-bold tracking-widest mb-2">DESTINATION DETAIL</div>
                <h2 className="text-4xl font-bold text-white mb-4">{nextWaypoint?.name}</h2>
                <div className="inline-block bg-zinc-800 px-4 py-2 rounded-full text-zinc-300 font-mono">
                  ETA {nextWaypointEta}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <Utensils className="text-orange-400 mb-2" />
                    <div className="font-bold text-sm">Gourmet</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {isKousuke ? '名物あなごめし (24h売店)' : 'フードコート / 売店あり'}
                    </div>
                 </div>
                 <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <Camera className="text-purple-400 mb-2" />
                    <div className="font-bold text-sm">View</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      展望台から大鳥居が見えるかも
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, subLabel, color, onClick }: any) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-row items-center justify-start gap-4 hover:bg-zinc-800 transition-colors"
  >
    <div className={`p-2 rounded-full bg-zinc-800 ${color}`}>
      <Icon size={24} />
    </div>
    <div className="flex flex-col items-start">
      <span className="text-sm font-bold text-white">{label}</span>
      <span className="text-[10px] font-bold text-zinc-500 uppercase">{subLabel}</span>
    </div>
  </motion.button>
);

const ItemCard = ({ item, icon }: { item: any, icon: string }) => (
  <div className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-lg">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-sm text-zinc-200">{item.title}</h3>
      <p className="text-xs text-zinc-500 truncate">{item.desc}</p>
    </div>
    <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2 py-1 rounded">{item.time}</span>
  </div>
);