export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const guessLocationName = (_lat: number, lng: number) => {
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
