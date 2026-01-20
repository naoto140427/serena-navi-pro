import React, { useEffect, useState } from 'react';
import { useNavStore } from '../../store/useNavStore';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, MapPin, Moon, Snowflake, Sun, Thermometer } from 'lucide-react';
import axios from 'axios';

// 天気コード（WMOコード）をアイコンに変換する関数
const getWeatherIcon = (code: number, isDay: boolean) => {
  if (code === 0) return isDay ? Sun : Moon;
  if (code >= 1 && code <= 3) return CloudSun;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return Snowflake;
  if (code >= 80 && code <= 82) return CloudDrizzle;
  if (code >= 95) return CloudLightning;
  return Cloud;
};

// 天気ラベル
const getWeatherLabel = (code: number) => {
  if (code === 0) return 'CLEAR';
  if (code <= 3) return 'CLOUDY';
  if (code <= 48) return 'FOG';
  if (code <= 67) return 'RAIN';
  if (code <= 77) return 'SNOW';
  if (code <= 82) return 'SHOWERS';
  if (code >= 95) return 'THUNDER';
  return '--';
};

export const WeatherWidget: React.FC = () => {
  const { currentLocation, currentAreaText } = useNavStore();
  const [temp, setTemp] = useState<number | null>(null);
  const [code, setCode] = useState<number>(0);
  const [isDay, setIsDay] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Open-Meteo API: 緯度経度から現在の天気を取得
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&current=temperature_2m,weather_code,is_day`;
        const res = await axios.get(url);
        
        setTemp(Math.round(res.data.current.temperature_2m));
        setCode(res.data.current.weather_code);
        setIsDay(res.data.current.is_day === 1);
      } catch (e) {
        console.error('Weather fetch failed', e);
      }
    };

    fetchWeather();
    // 10分おきに更新（移動して天気が変わるため）
    const timer = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, [currentLocation.lat, currentLocation.lng]); // 位置が変わるたびに再取得

  const Icon = getWeatherIcon(code, isDay);

  return (
    <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800 flex flex-col justify-between gap-2 h-full">
      <div className="text-zinc-500 text-xs font-bold flex items-center justify-between">
        <span>ENVIRONMENT</span>
        <Thermometer size={14} />
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col">
          <div className="flex items-start">
            <span className="text-4xl font-bold text-white tracking-tighter">
              {temp !== null ? temp : '--'}
            </span>
            <span className="text-lg text-zinc-400 mt-1 ml-1">°C</span>
          </div>
          <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
            {getWeatherLabel(code)}
          </div>
        </div>
        
        <div className={`w-12 h-12 flex items-center justify-center rounded-full ${isDay ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
           <Icon size={28} />
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-2 text-white overflow-hidden">
        <MapPin size={14} className="text-zinc-500 shrink-0" />
        <span className="text-xs font-bold truncate">{currentAreaText}</span>
      </div>
    </div>
  );
};