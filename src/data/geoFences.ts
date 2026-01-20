export interface GeoFence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // 反応する半径 (km)
  message: string; // AIに喋らせる内容のプロンプト
  triggered: boolean; // 一度鳴ったらOFFにするフラグ
}

export const initialGeoFences: GeoFence[] = [
  {
    id: 'kanmon',
    name: '関門橋 (県境)',
    lat: 33.9598,
    lng: 130.9616,
    radius: 2.0, // 2km圏内に入ったら発動
    message: '現在、関門海峡を通過中です。九州にお別れを告げ、本州・山口県へ入ります。ここから長い本州の旅が始まります！',
    triggered: false
  },
  {
    id: 'miyajima_view',
    name: '宮島近辺',
    lat: 34.3315,
    lng: 132.2982,
    radius: 5.0,
    message: '広島エリアを通過中です。左手に宮島が見えるかもしれません。カキフライの香りがしてきませんか？',
    triggered: false
  },
  {
    id: 'okayama_enter',
    name: '岡山県入り',
    lat: 34.60, 
    lng: 133.77, // 大体の県境
    radius: 10.0,
    message: '晴れの国、岡山県に入りました。桃太郎の故郷です。安全運転で進みましょう。',
    triggered: false
  },
  {
    id: 'kobe_night',
    name: '神戸・大阪エリア',
    lat: 34.75,
    lng: 135.25,
    radius: 8.0,
    message: '関西エリアに入ってきました。交通量が増えます。六甲山の景色を楽しみつつ、合流に注意してください。',
    triggered: false
  },
  {
    id: 'suzuka_gate',
    name: '鈴鹿サーキット直前',
    lat: 34.8431,
    lng: 136.5408,
    radius: 3.0,
    message: '目的地、鈴鹿サーキットエリアに到達しました！モータースポーツの聖地へようこそ。長旅、本当にお疲れ様でした！',
    triggered: false
  },
];