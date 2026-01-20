export interface GeoFence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // km
  message: string;
  triggered: boolean;
}

export const initialGeoFences: GeoFence[] = [
  // --- 往路 (行き) ---
  {
    id: 'kanmon_bridge',
    name: '関門橋',
    lat: 33.9598,
    lng: 130.9616,
    radius: 2.0,
    message: '九州脱出！本州・山口県へ突入します。ここから長い旅の始まりです。安全運転でいきましょう！',
    triggered: false
  },
  {
    id: 'miyajima_area',
    name: '宮島付近',
    lat: 34.3315,
    lng: 132.2982,
    radius: 5.0,
    message: '広島エリアを通過中。眠くないですか？宮島SAでスタバ休憩を入れるのもアリです。',
    triggered: false
  },
  {
    id: 'ise_entry',
    name: '伊勢エリア突入',
    lat: 34.45,
    lng: 136.70,
    radius: 5.0,
    message: 'ついに伊勢に到着！神聖な空気を感じてください。まずは内宮へ向かいましょう。赤福も待ってます！',
    triggered: false
  },
  {
    id: 'vison_near',
    name: 'VISON接近',
    lat: 34.4667,
    lng: 136.5222,
    radius: 3.0,
    message: '巨大リゾートVISONが近づいてきました。「本草湯」で旅の汗を流して、ととのいましょう。',
    triggered: false
  },
  {
    id: 'matsusaka_zone',
    name: '松阪牛エリア',
    lat: 34.5684,
    lng: 136.5401,
    radius: 3.0,
    message: 'この香り…松阪牛です！胃袋の準備はいいですか？今日は焼肉で優勝しましょう。',
    triggered: false
  },
  {
    id: 'nara_deer',
    name: '奈良公園接近',
    lat: 34.6850,
    lng: 135.8430,
    radius: 3.0,
    message: '奈良公園エリアです。鹿せんべい課金に注意。東大寺の大仏を見て、修学旅行気分を味わいましょう。',
    triggered: false
  },
  {
    id: 'arima_gold',
    name: '有馬温泉',
    lat: 34.7968,
    lng: 135.2478,
    radius: 2.0,
    message: '関西の奥座敷、有馬温泉です。濃厚な「金泉」に入りますよ。タオルが茶色くなるので注意！',
    triggered: false
  },
  {
    id: 'kobe_night',
    name: '神戸三宮',
    lat: 34.6908,
    lng: 135.1914,
    radius: 3.0,
    message: 'オシャレな街、神戸に到着。今夜はスカイスパからの夜景と、三宮の夜を楽しみましょう。',
    triggered: false
  },

  // --- 復路 (帰り: 陸路爆走) ---
  {
    id: 'hiroshima_return',
    name: '広島市内接近',
    lat: 34.3915,
    lng: 132.4630,
    radius: 5.0,
    message: '広島市内に近づいてきました。ランチタイムです！本場の「お好み焼き」を食べてエネルギーチャージしましょう。',
    triggered: false
  },
  {
    id: 'yamaguchi_run',
    name: '山口県突入',
    lat: 34.1,
    lng: 132.0,
    radius: 10.0,
    message: '山口県に入りました。ガードレールが黄色くなります。九州まであと少し！ラストスパートです。',
    triggered: false
  },
  {
    id: 'kanmon_back',
    name: '関門橋 (帰還)',
    lat: 33.9598,
    lng: 130.95, // 本州側からアプローチ
    radius: 2.0,
    message: '関門橋が見えました！九州に帰ってきましたよ。グランドツアー完走、お疲れ様でした！あと少しで自宅です。',
    triggered: false
  }
];