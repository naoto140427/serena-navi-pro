import { create } from 'zustand';
import { db } from '../lib/firebase';
import { ref, onValue, set as firebaseSet, remove, push, update } from 'firebase/database';
import type { NavState, Waypoint, Expense, AppNotification, AppMode } from '../types';
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
  setAppMode: (mode: AppMode) => void; // 追加
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
  if (lng < 130.5) return "福岡県";
  if (lng < 131.5) return "大分県 / 宮河内"; 
  if (lng < 132.0) return "大分県 / 佐賀関";
  if (lng < 132.5) return "愛媛県 / 佐田岬";
  if (lng < 133.0) return "愛媛県 / 松山道";
  if (lng < 134.0) return "香川県 / 高松道";
  if (lng < 134.8) return "徳島県 / 鳴門";
  if (lng < 135.0) return "兵庫県 / 淡路島";
  if (lng < 135.5) return "兵庫県 / 神戸";
  return "Highway Cruising";
};

interface ExtendedNavState extends NavState {
  geoFences: GeoFence[];
}

export const useNavStore = create<ExtendedNavState & NavActions>((set, get) => ({
  mode: 'driver',
  currentUser: null,
  currentLocation: { lat: 34.805, lng: 135.350 }, // 宝塚付近
  currentSpeed: 0,
  currentAreaText: "READY TO DEPART",
  nearestFacilityText: "GPS信号 待機中...",
  todaysGoalText: "フェリー出港まで...",
  nextWaypointEta: "--:--",
  activeNotification: null,
  expenses: [],
  trafficInfo: { riskLevel: 0, jamDistance: 0, nextReg: '順調' },
  geoFences: initialGeoFences,
  appMode: 'launcher', // 初期値

  // Waypoints定義 (既存のもの)
  waypoints: [
    { 
      id: 'start', name: 'Start: 宝塚IC', coords: { lat: 34.805, lng: 135.350 }, type: 'start',
      description: '伝説の旅、フィナーレへ。四国経由で帰還せよ。',
      image: 'https://images.unsplash.com/photo-1565675402246-86d708f50c76?q=80&w=800',
      quests: ['高松道ルート確認', 'フェリー運行状況チェック'],
      specs: { toilet: 'clean', smoking: true, vending: true },
      weather: { type: 'cloudy', temp: '9°C' },
      scheduledTime: '14:45'
    },
    { 
      id: 'awaji_sa', name: '🌉 淡路SA (下り)', coords: { lat: 34.6067, lng: 135.0117 }, type: 'parking',
      description: '明石海峡大橋を渡ってすぐ。絶景のスタバ休憩。',
      image: 'https://images.unsplash.com/photo-1596545738622-540c15383501?q=80&w=800',
      quests: ['橋バックで記念撮影', '明石焼き食べる？'],
      driverIntel: { parking: 'とんでもなく広い。観覧車を目印に。', road: '風が強い日は橋の上でハンドル取られるので注意。' },
      gourmet: { item: '淡路玉ねぎスープ', price: '¥0', tip: 'お土産コーナーで試飲ができるかも。' },
      specs: { toilet: 'clean', smoking: true, vending: true },
      weather: { type: 'sunny', temp: '11°C' },
      scheduledTime: '15:20'
    },
    { 
      id: 'tsuda_sa', name: '🍜 津田の松原SA', coords: { lat: 34.2835, lng: 134.2562 }, type: 'parking',
      description: '香川県突入。高速降りずに讃岐うどん。',
      image: 'https://images.unsplash.com/photo-1621235332306-69f3797621c4?q=80&w=800',
      budget: '¥',
      quests: ['「あなぶき家」でうどん', 'ちくわ天トッピング'],
      gourmet: { item: 'かけうどん', price: '¥450', tip: 'SAのレベルを超えてる。コシが命。' },
      driverIntel: { parking: 'そこまで混んでない穴場。松林が見える。', road: '高松道はオービス多め。飛ばしすぎ注意。' },
      specs: { toilet: 'normal', smoking: true, vending: true },
      weather: { type: 'sunny', temp: '12°C' },
      scheduledTime: '16:50'
    },
    { 
      id: 'iyonada_sa', name: '🌇 伊予灘SA', coords: { lat: 33.7258, lng: 132.7303 }, type: 'parking',
      description: '夕焼けの聖地。フェリー前の最終ピットイン。',
      image: 'https://images.unsplash.com/photo-1622365289947-66914b306155?q=80&w=800',
      quests: ['伊予灘の夕景/夜景', 'じゃこ天購入'],
      driverIntel: { parking: '高台にあるので景色最高。フェリーまであと1.5時間。', road: 'ここを出たら大洲ICまで行ってメロディーラインへ。' },
      specs: { toilet: 'clean', smoking: true, vending: true },
      weather: { type: 'sunny', temp: '10°C' },
      scheduledTime: '18:50'
    },
    { 
      id: 'misaki_port', name: '⛴️ 国道九四フェリー 三崎港', coords: { lat: 33.3931, lng: 132.1225 }, type: 'sightseeing',
      description: '四国の最西端。ここから九州へワープ。',
      image: 'https://images.unsplash.com/photo-1559868350-136511a0b368?q=80&w=800',
      budget: '¥¥',
      quests: ['乗船手続き', 'ドライバー仮眠'],
      driverIntel: { parking: '誘導員の指示に従って整列。車検証の準備を忘れずに。', road: 'メロディーラインは夜真っ暗＆動物注意。' },
      specs: { toilet: 'normal', smoking: true, vending: true },
      weather: { type: 'cloudy', temp: '9°C' },
      scheduledTime: '20:50'
    },
    { 
      id: 'ferry_rest', name: '🚢 船内休憩 (70分)', coords: { lat: 33.32, lng: 132.0 }, type: 'parking',
      description: '運転なしのボーナスタイム。佐賀関まで爆睡。',
      image: 'https://images.unsplash.com/photo-1502479532599-7f309a657c96?q=80&w=800',
      quests: ['雑魚寝エリア確保', '甲板で星を見る'],
      specs: { toilet: 'normal', smoking: false, vending: true },
      weather: { type: 'night', temp: '8°C' },
      scheduledTime: '21:30'
    },
    { 
      id: 'saganoseki', name: '🏁 佐賀関港 (大分)', coords: { lat: 33.2558, lng: 131.8617 }, type: 'start',
      description: '九州上陸。帰ってきた。',
      image: 'https://images.unsplash.com/photo-1565613387859-968987483750?q=80&w=800',
      quests: ['安全運転でラストスパート', '関あじ関さばの看板を見る'],
      driverIntel: { parking: '下船時は前の車に続いて速やかに。', road: '宮河内までは一本道。' },
      specs: { toilet: 'normal', smoking: true, vending: true },
      weather: { type: 'cloudy', temp: '8°C' },
      scheduledTime: '22:40'
    },
    { id: 'goal', name: 'Goal: 自宅 (宮河内)', coords: { lat: 33.1916, lng: 131.7021 }, type: 'goal', scheduledTime: '23:30' },
  ],
  nextWaypoint: { id: 'awaji_sa', name: '🌉 淡路SA (下り)', coords: { lat: 34.6067, lng: 135.0117 }, type: 'parking' } as Waypoint,

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

  setAppMode: (mode) => set({ appMode: mode }),

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