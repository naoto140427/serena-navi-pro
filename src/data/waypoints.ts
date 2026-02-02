import type { Waypoint } from '../types';

export const waypoints: Waypoint[] = [
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
];
