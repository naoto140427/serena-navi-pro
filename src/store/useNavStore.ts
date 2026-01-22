import { create } from 'zustand';
import { db } from '../lib/firebase';
import { ref, onValue, set as firebaseSet, remove, push } from 'firebase/database';
import type { NavState, Waypoint, Expense, AppNotification } from '../types';
import { initialGeoFences, type GeoFence } from '../data/geoFences';

// Storeのアクション定義
interface NavActions {
  setMode: (mode: 'driver' | 'passenger') => void;
  setCurrentUser: (name: string) => void;
  setNextWaypoint: (id: string) => void;
  initializeSync: () => void;
  sendNotification: (notification: Omit<AppNotification, 'timestamp'>) => void;
  clearNotification: () => void;
  addExpense: (title: string, amount: number, payer: string) => void;
  removeExpense: (id: string) => void;
  updateLocation: (lat: number, lng: number, speed: number | null) => void;
  resetGeoFences: () => void;
}

// 距離計算ヘルパー
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// エリア名推定
const guessLocationName = (_lat: number, lng: number) => {
  if (lng < 131.0) return "福岡県 / 関門エリア";
  if (lng < 131.8) return "大分県内"; 
  if (lng < 132.5) return "山口県 / 岩国周辺";
  if (lng < 133.5) return "広島県内";
  if (lng < 134.5) return "岡山県内";
  if (lng < 135.5) return "兵庫県 / 大阪府";
  if (lng < 136.0) return "京都府 / 滋賀県";
  if (lng < 137.0) return "三重県 / 伊勢エリア";
  return "Highway Cruising";
};

// State拡張
interface ExtendedNavState extends NavState {
  geoFences: GeoFence[];
}

export const useNavStore = create<ExtendedNavState & NavActions>((set, get) => ({
  // --- Initial State ---
  mode: 'driver',
  currentUser: null,
  currentLocation: { lat: 33.1916, lng: 131.7021 },
  currentSpeed: 0,
  currentAreaText: "READY TO DEPART",
  nearestFacilityText: "GPS信号 待機中...",
  todaysGoalText: "目的地計算中...",
  nextWaypointEta: "--:--",
  activeNotification: null,
  expenses: [],
  trafficInfo: {
    riskLevel: 0,
    jamDistance: 0,
    nextReg: '順調'
  },
  geoFences: initialGeoFences,

// src/store/useNavStore.ts の waypoints 部分

  waypoints: [
    // Day 0: 出発
    { 
      id: 'start', name: 'Start: 自宅 (宮河内)', coords: { lat: 33.1916, lng: 131.7021 }, type: 'start',
      description: 'Grand Tour 2026、作戦開始地点。',
      image: 'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=800&auto=format&fit=crop',
      quests: ['戸締まり確認', 'ガスの元栓確認', '財布・スマホ確認', '出発の記念撮影'],
      tips: '忘れ物はない？特に充電ケーブルと眼鏡。'
    },
    { id: 'pick_haga', name: 'Pick: 芳賀 (丹川)', coords: { lat: 33.2050, lng: 131.7050 }, type: 'pickup' },
    { id: 'pick_taira', name: 'Pick: 平良 (萩原)', coords: { lat: 33.2436, lng: 131.6418 }, type: 'pickup' },
    
    // Day 0 Night
    { 
      id: 'kanmon', name: '関門橋 (本州へ)', coords: { lat: 33.9598, lng: 130.9616 }, type: 'parking',
      description: '九州と本州の境界線。ここを越えれば旅の本番。',
      image: 'https://images.unsplash.com/photo-1571661601662-72049e25d028?q=80&w=800&auto=format&fit=crop',
      quests: ['橋の真ん中で叫ぶ（心の中で）', '夜景をバックに車内で乾杯（コーヒーで）'],
      tips: '深夜のSAはトラックが多いので駐車位置に注意。'
    },
    { id: 'miyajima_sa', name: '宮島SA (深夜休憩)', coords: { lat: 34.3315, lng: 132.2982 }, type: 'parking' },
    
    // Day 1
    { 
      id: 'ise_jingu', name: '伊勢神宮 内宮', coords: { lat: 34.4560, lng: 136.7250 }, type: 'sightseeing',
      description: '日本人の心のふるさと。2000年の歴史を持つ聖地。',
      image: 'https://images.unsplash.com/photo-1572935260193-27150098df24?q=80&w=800&auto=format&fit=crop',
      budget: '¥',
      quests: ['五十鈴川で手を清める', '正宮で感謝を伝える（願い事NG）', '大木からパワーを吸い取る'],
      tips: '外宮→内宮の順が正式だが、今回は時間がないので内宮一点突破でいく。'
    },
    { 
      id: 'okage', name: 'おかげ横丁', coords: { lat: 34.4631, lng: 136.7228 }, type: 'sightseeing',
      description: '食べ歩き天国。ここが本番と言っても過言ではない。',
      image: 'https://images.unsplash.com/photo-1624867490072-5264b360f772?q=80&w=800&auto=format&fit=crop',
      budget: '¥¥',
      quests: ['赤福本店で作りたてを食べる', '松阪牛コロッケを食べる', '伊勢うどん（コシなし）を体験する'],
      tips: '赤福は「盆（2個入）」がコスパ最強。回転早いので並んでもすぐ入れる。'
    },
    { 
      id: 'yokoyama', name: '横山展望台', coords: { lat: 34.3015, lng: 136.7820 }, type: 'sightseeing',
      description: '英虞湾を一望できる天空のテラス。映えスポット。',
      image: 'https://images.unsplash.com/photo-1605623068996-52ce6497f537?q=80&w=800&auto=format&fit=crop',
      quests: ['天空カフェ・テラスで写真を撮る', '英虞湾の島を数える'],
      tips: '駐車場から少し歩く。スニーカー推奨。カフェのソフトクリームが濃厚で美味い。'
    },
    { 
      id: 'vison_onsen', name: '♨️ VISON 本草湯', coords: { lat: 34.4667, lng: 136.5222 }, type: 'parking',
      description: '薬草湯で整う。三重の最新巨大リゾート施設。',
      image: 'https://images.unsplash.com/photo-1560965034-7a91173872fb?q=80&w=800&auto=format&fit=crop',
      budget: '¥',
      quests: ['薬草湯の香りを堪能する', '露天風呂で外気浴', '風呂上がりの牛乳'],
      tips: 'VISON全体は広すぎるので、風呂（本草湯）に狙いを定めること。'
    },
    { 
      id: 'matsusaka_beef', name: '🥩 一升びん本店', coords: { lat: 34.5684, lng: 136.5401 }, type: 'sightseeing',
      description: '松阪牛の回転焼肉…ではなく本店でガッツリ。味噌ダレが絶品。',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop',
      budget: '¥¥¥',
      quests: ['A5ランク松阪牛を拝む', '白米をおかわりする', '会計の金額を見ない'],
      tips: '服に匂いがつくので覚悟すること。味噌ダレは焦げやすいので頻繁にひっくり返すべし。'
    },
    { 
      id: 'dormy_tsu', name: '🏨 ドーミーイン津', coords: { lat: 34.7186, lng: 136.5113 }, type: 'hotel',
      description: '安心と信頼のドーミーイン。サウナ・水風呂完備。',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      quests: ['21:30〜 夜鳴きそばを食べる', '朝サウナで整う', '乳酸菌飲料をゲットする'],
      tips: '津駅の目の前。コンビニは駅にある。'
    },

    // Day 2
    { 
      id: 'nara_park', name: '奈良公園', coords: { lat: 34.6850, lng: 135.8430 }, type: 'sightseeing',
      description: '鹿と大仏の国。修学旅行の思い出をアップデートせよ。',
      image: 'https://images.unsplash.com/photo-1579405625345-d86b97666272?q=80&w=800&auto=format&fit=crop',
      budget: '¥',
      quests: ['鹿せんべい課金（200円）', '鹿に囲まれてパニックになる', '東大寺の柱の穴くぐり（サイズ的に無理か確認）'],
      tips: '鹿のフンに注意。鹿はお辞儀をするとお辞儀し返してくれる（こともある）。'
    },
    { 
      id: 'arima_onsen', name: '♨️ 有馬温泉 金の湯', coords: { lat: 34.7968, lng: 135.2478 }, type: 'parking',
      description: '日本最古の湯。金泉（含鉄泉）はタオルが茶色くなるほど濃厚。',
      image: 'https://images.unsplash.com/photo-1629858547492-b05421c60d9d?q=80&w=800&auto=format&fit=crop',
      budget: '¥¥',
      quests: ['金泉に10分以上浸かる', 'ありまサイダーを飲む', '温泉街でコロッケを食べる'],
      tips: '白いタオルは持っていかないこと（絶対落ちない茶色になる）。近くの「銀の湯」は炭酸泉。'
    },
    { 
      id: 'kobe_hotel', name: '🏨 カンデオホテルズ神戸', coords: { lat: 34.6908, lng: 135.1914 }, type: 'hotel',
      description: '神戸の夜景を一望できるスカイスパが自慢。ラグジュアリー。',
      image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=800&auto=format&fit=crop',
      quests: ['スカイスパから夜景を見る', '三宮の夜の街へ繰り出す', 'お洒落なBARを探す'],
      tips: '元町中華街も徒歩圏内。朝食ビュッフェが豪華なので寝坊厳禁。'
    },

    // Day 3
    { 
      id: 'himeji', name: '姫路城 (通過)', coords: { lat: 34.8394, lng: 134.6939 }, type: 'sightseeing',
      description: '白鷺城。世界遺産。高速から一瞬見える白い輝きを見逃すな。',
      image: 'https://images.unsplash.com/photo-1598424976729-197e44927f1c?q=80&w=800&auto=format&fit=crop',
      quests: ['高速から城を見つける', '助手席の人が写真を撮る'],
      tips: '姫路バイパス・山陽道からの視認性は一瞬。集中せよ。'
    },
    { 
      id: 'hiroshima_okonomi', name: '🍴 広島お好み村', coords: { lat: 34.3915, lng: 132.4630 }, type: 'sightseeing',
      description: 'お好み焼きのテーマパーク。観光客向けだが、やはり美味い。',
      image: 'https://images.unsplash.com/photo-1582236592263-471239845942?q=80&w=800&auto=format&fit=crop',
      budget: '¥¥',
      quests: ['「広島焼き」と言わずに注文する', 'ヘラを使って鉄板から直で食べる', 'カープソースの味を知る'],
      tips: '「あとむ」か「八昌」が有名どころ。マヨネーズは邪道とされる場合があるが、好きにかけるべし。'
    },
    { id: 'miyajima_sa_day', name: '⛩️ 宮島SA', coords: { lat: 34.3315, lng: 132.2982 }, type: 'parking' },
    { id: 'mitou_sa', name: '美東SA (山口)', coords: { lat: 34.1535, lng: 131.3373 }, type: 'parking' },
    { 
      id: 'kanmon_return', name: '関門橋 (帰還)', coords: { lat: 33.9598, lng: 130.9616 }, type: 'parking',
      description: '旅の終わり。九州に戻ってきた安心感と寂しさ。',
      image: 'https://images.unsplash.com/photo-1571661601662-72049e25d028?q=80&w=800&auto=format&fit=crop',
      quests: ['「帰ってきたぞー！」と叫ぶ', '残りの予算を確認して絶望する'],
      tips: 'ここから自宅までまだ距離がある。気を抜かないこと。'
    },
    { id: 'goal', name: 'Goal: 自宅', coords: { lat: 33.1916, lng: 131.7021 }, type: 'goal' },
  ],
  // 最初の目的地をセット
  nextWaypoint: { id: 'pick_haga', name: 'Pick: 芳賀 (丹川)', coords: { lat: 33.2050, lng: 131.7050 }, type: 'pickup' } as Waypoint,

  // --- Actions ---
  setMode: (mode) => set({ mode }),
  setCurrentUser: (name) => set({ currentUser: name }),

  setNextWaypoint: (id) => {
    const state = get();
    const targetWP = state.waypoints.find(w => w.id === id);
    if (targetWP) {
      const wpRef = ref(db, 'state/nextWaypoint');
      firebaseSet(wpRef, targetWP);
      const notifRef = ref(db, 'state/activeNotification');
      firebaseSet(notifRef, {
        id: Date.now().toString(),
        type: 'info',
        message: `目的地を「${targetWP.name}」に変更しました`,
        sender: state.currentUser || 'Co-Pilot',
        timestamp: Date.now()
      });
    }
  },

  initializeSync: () => {
    const notifRef = ref(db, 'state/activeNotification');
    onValue(notifRef, (snapshot) => {
      set({ activeNotification: snapshot.val() });
    });
    const wpRef = ref(db, 'state/nextWaypoint');
    onValue(wpRef, (snapshot) => {
      const data = snapshot.val();
      if (data) set({ nextWaypoint: data });
    });
    const expensesRef = ref(db, 'expenses');
    onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expensesList = Object.values(data) as Expense[];
        expensesList.sort((a, b) => b.timestamp - a.timestamp);
        set({ expenses: expensesList });
      } else {
        set({ expenses: [] });
      }
    });
  },

  sendNotification: (notification) => {
    const notifRef = ref(db, 'state/activeNotification');
    firebaseSet(notifRef, { ...notification, timestamp: Date.now() });
  },

  clearNotification: () => {
    const notifRef = ref(db, 'state/activeNotification');
    remove(notifRef);
  },

  addExpense: (title, amount, payer) => {
    const expensesRef = ref(db, 'expenses');
    const newExpenseRef = push(expensesRef);
    firebaseSet(newExpenseRef, { id: newExpenseRef.key, title, amount, payer, timestamp: Date.now() });
  },

  removeExpense: (id) => {
    const expenseRef = ref(db, `expenses/${id}`);
    remove(expenseRef);
  },

  resetGeoFences: () => {
    set({ geoFences: initialGeoFences });
  },

  updateLocation: (lat, lng, speed) => {
    const state = get();
    const nextWP = state.nextWaypoint;
    const areaText = guessLocationName(lat, lng);
    let distText = state.nearestFacilityText;
    let etaText = "--:--";

    if (nextWP) {
      const dist = calculateDistance(lat, lng, nextWP.coords.lat, nextWP.coords.lng);
      distText = `目的地まで ${dist.toFixed(1)} km`;
      const hoursLeft = dist / 80; 
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + hoursLeft * 60 * 60 * 1000);
      etaText = arrivalTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }

    let goalWP = state.waypoints[state.waypoints.length - 1];
    let goalText = "計算中...";
    if (goalWP) {
      const distToGoal = calculateDistance(lat, lng, goalWP.coords.lat, goalWP.coords.lng);
      goalText = `Goalまで残り ${Math.round(distToGoal)} km`;
    }
    const kmh = speed ? Math.round(speed * 3.6) : 0;

    // ジオフェンスチェック
    const hitFence = state.geoFences.find(fence => {
      if (fence.triggered) return false;
      const dist = calculateDistance(lat, lng, fence.lat, fence.lng);
      return dist <= fence.radius;
    });

    if (hitFence) {
      console.log("GeoFence Hit:", hitFence.name);
      
      const notifRef = ref(db, 'state/activeNotification');
      firebaseSet(notifRef, {
        id: Date.now().toString(),
        type: 'info',
        message: `📍 ${hitFence.name} に到達しました`,
        sender: 'Serena AI',
        timestamp: Date.now(),
        payload: { tts: hitFence.message } 
      });

      set(prev => ({
        geoFences: prev.geoFences.map(f => f.id === hitFence.id ? { ...f, triggered: true } : f)
      }));
    }

    set({
      currentLocation: { lat, lng },
      currentSpeed: kmh,
      currentAreaText: areaText,
      nearestFacilityText: distText,
      todaysGoalText: goalText,
      nextWaypointEta: etaText,
    });
  }
}));