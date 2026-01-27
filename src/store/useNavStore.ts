import { create } from 'zustand';
import { db } from '../lib/firebase';
import { ref, onValue, set as firebaseSet, remove, push, update } from 'firebase/database';
import type { NavState, Waypoint, Expense, AppNotification } from '../types';
import { initialGeoFences, type GeoFence } from '../data/geoFences';

interface NavActions {
  setMode: (mode: 'driver' | 'passenger') => void;
  setCurrentUser: (name: string) => void;
  setNextWaypoint: (id: string) => void;
  initializeSync: () => void;
  sendNotification: (notification: Omit<AppNotification, 'timestamp'>) => void;
  clearNotification: () => void;
  addExpense: (title: string, amount: number, payer: string) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  updateLocation: (lat: number, lng: number, speed: number | null) => void;
  resetGeoFences: () => void;
  resetAllData: () => void;
  refreshRouteData: () => void;
}

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

interface ExtendedNavState extends NavState {
  geoFences: GeoFence[];
}

export const useNavStore = create<ExtendedNavState & NavActions>((set, get) => ({
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
  trafficInfo: { riskLevel: 0, jamDistance: 0, nextReg: '順調' },
  geoFences: initialGeoFences,

  waypoints: [
    { 
      id: 'start', name: 'Start: 宮河内', coords: { lat: 33.1916, lng: 131.7021 }, type: 'start',
      description: '伝説の始まり。全ての準備は整った。',
      image: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=800',
      quests: ['戸締まり・火の元よし', '財布・スマホよし', 'ETCカードよし'],
      specs: { toilet: 'clean', smoking: true, vending: true },
      weather: { type: 'cloudy', temp: '8°C' },
      scheduledTime: '20:00'
    },
    { id: 'pick_haga', name: 'Pick: 芳賀', coords: { lat: 33.2050, lng: 131.7050 }, type: 'pickup', scheduledTime: '20:15' },
    { id: 'pick_taira', name: 'Pick: 平良', coords: { lat: 33.2436, lng: 131.6418 }, type: 'pickup', scheduledTime: '20:45' },
    { 
      id: 'kanmon', name: '関門橋 (めかりPA)', coords: { lat: 33.9598, lng: 130.9616 }, type: 'parking',
      description: '九州脱出ポイント。夜景を見ながら最後の作戦会議。',
      image: 'https://images.unsplash.com/photo-1617441865952-4e4f26040714?q=80&w=800',
      quests: ['橋をバックに記念撮影', '眠気覚ましのコーヒー調達'],
      driverIntel: { parking: '大型トラック多し。駐車枠内の接触に注意。', road: 'ここから本州。風が強い日はハンドル取られるので注意。' },
      specs: { toilet: 'normal', smoking: true, vending: true },
      weather: { type: 'sunny', temp: '6°C' },
      scheduledTime: '22:30'
    },
    { 
      id: 'ise_jingu', name: '伊勢神宮 内宮', coords: { lat: 34.4560, lng: 136.7250 }, type: 'sightseeing',
      description: '日本最強のパワースポット。2000年の歴史。',
      image: 'https://images.unsplash.com/photo-1572935260193-27150098df24?q=80&w=800',
      budget: '¥',
      quests: ['五十鈴川で手を清める', '正宮で感謝のみを伝える', '交通安全のお守りを買う'],
      driverIntel: { parking: 'A駐車場は激混み&狭い。遠くてもB駐車場を狙え。', road: 'IC降りてからの合流が短いので加速しっかり。' },
      specs: { toilet: 'clean', smoking: false, vending: false },
      weather: { type: 'sunny', temp: '12°C' },
      scheduledTime: '10:00'
    },
    { 
      id: 'okage', name: 'おかげ横丁', coords: { lat: 34.4631, lng: 136.7228 }, type: 'sightseeing',
      description: '食の欲望解放区。内宮のすぐ横。',
      image: 'https://images.unsplash.com/photo-1599405658603-9e900d23ec1d?q=80&w=800',
      budget: '¥¥',
      quests: ['食い倒れる', '土産を買う'],
      gourmet: { item: '赤福本店「盆」', price: '¥300', tip: '回転早いので並べ。冬なら赤福ぜんざいもアリ。' },
      specs: { toilet: 'normal', smoking: true, vending: true },
      weather: { type: 'sunny', temp: '13°C' },
      scheduledTime: '12:00'
    },
    { 
      id: 'vison_onsen', name: '♨️ VISON 本草湯', coords: { lat: 34.4667, lng: 136.5222 }, type: 'parking',
      description: '三重の最新リゾートにある薬草湯。',
      image: 'https://images.unsplash.com/photo-1634914040989-11c2780b957e?q=80&w=800',
      budget: '¥',
      quests: ['薬草湯で深呼吸', '外気浴で整う'],
      driverIntel: { parking: '風呂利用なら「本草湯」最寄りのP8へ。広大なので間違えると歩く。', road: 'スマートIC直結。ETCカード確認。' },
      specs: { toilet: 'clean', smoking: true, vending: true },
      weather: { type: 'cloudy', temp: '10°C' },
      scheduledTime: '15:00'
    },
    { 
      id: 'matsusaka_beef', name: '🥩 一升びん本店', coords: { lat: 34.5684, lng: 136.5401 }, type: 'sightseeing',
      description: '回転焼肉の聖地。味噌ダレ松阪牛。',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800',
      budget: '¥¥¥',
      quests: ['A5肉を拝む', '白米おかわり'],
      gourmet: { item: '松阪牛セット', price: '¥3500~', tip: '服に匂いがつくので上着は車に置くのがプロ。' },
      driverIntel: { parking: '店前は狭い。第二駐車場の方が安全。', road: '夜は看板が見えにくいのでCo-Pilotが注視せよ。' },
      specs: { toilet: 'normal', smoking: true, vending: false },
      weather: { type: 'rain', temp: '8°C' },
      scheduledTime: '18:00'
    },
    { 
      id: 'dormy_inn_tsu', name: '🏨 ドーミーイン津', coords: { lat: 34.7332, lng: 136.5117 }, type: 'hotel', scheduledTime: '21:00',
      description: 'DAY 1 GOAL. サウナで整え。', 
      image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=800',
      quests: ['夜鳴きそば', '朝風呂'],
      specs: { toilet: 'clean', smoking: true, vending: true },
      weather: { type: 'cloudy', temp: '5°C' }
    },
    { 
      id: 'metasequoia', name: '🌲 メタセコイア並木', coords: { lat: 35.4568, lng: 136.0355 }, type: 'sightseeing',
      description: '冬のソナタ的絶景ロード。早朝アタック推奨。',
      image: 'https://images.unsplash.com/photo-1542358896-7e3e4a9e5251?q=80&w=800',
      quests: ['並木道で愛車撮影', 'マキノピックランド'],
      driverIntel: { parking: '「マキノピックランド」駐車場が無料。路駐は絶対NG。', road: '冬は積雪エリア。ノーマルタイヤならライブカメラ要確認。' },
      specs: { toilet: 'normal', smoking: true, vending: true },
      weather: { type: 'snow', temp: '2°C' },
      scheduledTime: '09:30'
    },
    { 
      id: 'kyoto_kiyomizu', name: '⛩️ 京都・清水寺', coords: { lat: 34.9948, lng: 135.7850 }, type: 'sightseeing',
      description: '京都の象徴。清水の舞台から飛び降りるつもりで楽しめ。',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800',
      budget: '¥¥',
      quests: ['清水の舞台で写真', '音羽の滝で水を飲む', '二年坂で食べ歩き'],
      gourmet: { item: '湯豆腐 or 抹茶スイーツ', price: '¥1500', tip: '参道の誘惑に負けるな。奥まで行けば絶景カフェあり。' },
      driverIntel: { parking: '清水寺周辺は地獄の混雑＆一方通行。少し離れた「五条坂」周辺のコインパ推奨。', road: '歩行者が神。絶対に徐行。' },
      specs: { toilet: 'normal', smoking: false, vending: true },
      weather: { type: 'sunny', temp: '14°C' },
      scheduledTime: '13:00'
    },
    { 
      id: 'nara_park', name: '🦌 奈良公園・東大寺', coords: { lat: 34.6850, lng: 135.8430 }, type: 'sightseeing',
      description: '鹿の帝国＆世界最大級の木造建築。奈良に来たなら必須。',
      image: 'https://images.unsplash.com/photo-1579405625345-d86b97666272?q=80&w=800',
      budget: '¥',
      quests: ['大仏殿で圧倒される', '柱の穴くぐり', '鹿せんべい課金'],
      driverIntel: { parking: '県営駐車場が安牌だが混む。少し離れたコインパ推奨。', road: '鹿の飛び出し注意（マジで出る）。' },
      specs: { toilet: 'normal', smoking: false, vending: true },
      weather: { type: 'sunny', temp: '15°C' },
      scheduledTime: '16:00'
    },
    { 
      id: 'arima_onsen', name: '♨️ 有馬温泉 金の湯', coords: { lat: 34.7968, lng: 135.2478 }, type: 'parking',
      description: '日本最古の湯。金泉はタオルが茶色くなる。',
      image: 'https://images.unsplash.com/photo-1549643276-fbc2bd5259d4?q=80&w=800',
      budget: '¥¥',
      quests: ['金泉に10分浸かる', 'ありまサイダー飲む'],
      driverIntel: { parking: '温泉街は道が激狭。無理せず「有馬里駐車場」に入れて送迎バスを使え。', road: '坂道発進多し。' },
      gourmet: { item: '竹中肉店コロッケ', price: '¥150', tip: '揚げたてを狙え。' },
      specs: { toilet: 'clean', smoking: false, vending: true },
      weather: { type: 'cloudy', temp: '11°C' },
      scheduledTime: '19:00'
    },
    { 
      id: 'kobe_hotel', name: '🏨 カンデオホテルズ神戸', coords: { lat: 34.6908, lng: 135.1914 }, type: 'hotel',
      description: '天空のスカイスパ完備。神戸の夜景を一望。',
      image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=800',
      quests: ['スカイスパで夜景鑑賞', '朝食ビュッフェ制覇'],
      driverIntel: { parking: '提携駐車場ありだが、高さ制限に注意。要確認。', road: '一方通行多し。ナビ絶対遵守。' },
      specs: { toilet: 'clean', smoking: true, vending: true },
      weather: { type: 'rain', temp: '9°C' },
      scheduledTime: '21:00'
    },
    { 
      id: 'hiroshima_okonomi', name: '🍴 広島お好み村', coords: { lat: 34.3915, lng: 132.4630 }, type: 'sightseeing',
      description: '粉もんタワー。',
      image: 'https://images.unsplash.com/photo-1582236592263-471239845942?q=80&w=800',
      budget: '¥¥',
      quests: ['ヘラで直食い', 'カープソース堪能'],
      gourmet: { item: 'そば肉玉（イカ天）', price: '¥900', tip: '「あとむ」か「八昌」が鉄板。マヨは邪道扱いされる店もあるので空気読め。' },
      driverIntel: { parking: '繁華街ど真ん中。高い。少し離れた「ヤマダ電機」提携等が安いかも。', road: '路面電車と並走。右折時注意。' },
      specs: { toilet: 'normal', smoking: false, vending: false },
      weather: { type: 'sunny', temp: '14°C' },
      scheduledTime: '12:00'
    },
    { 
      id: 'kanmon_return', name: '関門橋 (帰還)', coords: { lat: 33.9598, lng: 130.9616 }, type: 'parking',
      description: 'ただいま九州。旅の終わり。',
      image: 'https://images.unsplash.com/photo-1550953685-5a43924e2373?q=80&w=800',
      quests: ['残金確認', '運転手に感謝'],
      specs: { toilet: 'normal', smoking: true, vending: true },
      weather: { type: 'cloudy', temp: '10°C' },
      scheduledTime: '16:00'
    },
    { id: 'goal', name: 'Goal: 自宅', coords: { lat: 33.1916, lng: 131.7021 }, type: 'goal', scheduledTime: '19:00' },
  ],
  nextWaypoint: { id: 'pick_haga', name: 'Pick: 芳賀 (丹川)', coords: { lat: 33.2050, lng: 131.7050 }, type: 'pickup' } as Waypoint,

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

  updateExpense: (id, data) => {
    const expenseRef = ref(db, `expenses/${id}`);
    update(expenseRef, { ...data });
  },

  resetGeoFences: () => {
    set({ geoFences: initialGeoFences });
  },

  resetAllData: () => {
    const expensesRef = ref(db, 'expenses');
    remove(expensesRef);
    console.log("Expenses reset.");
  },

  refreshRouteData: () => {
    console.log("Route data refreshed.");
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

    const hitFence = state.geoFences.find(fence => {
      if (fence.triggered) return false;
      const dist = calculateDistance(lat, lng, fence.lat, fence.lng);
      return dist <= fence.radius;
    });

    if (hitFence) {
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