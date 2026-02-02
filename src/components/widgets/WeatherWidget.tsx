import React, { useEffect, useState } from 'react';
import { useNavStore } from '../../store/useNavStore';
// ★修正: 使っていない 'Droplets' を削除しました
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 天気データの型定義
interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity?: number;
  isDay: boolean;
}

export const WeatherWidget: React.FC = () => {
  const { currentAreaText } = useNavStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  // WMO Weather Codes をアイコン/色に変換する関数
  const getWeatherConfig = (code: number, isDay: boolean) => {
    // 0: Clear sky
    if (code === 0) return { 
      icon: <Sun className={isDay ? "text-orange-400" : "text-blue-200"} size={32} />, 
      label: isDay ? "Sunny" : "Clear", 
      bg: "from-orange-500/20 to-yellow-500/5",
      text: "text-orange-100"
    };
    // 1-3: Partly cloudy
    if (code <= 3) return { 
      icon: <Cloud className="text-gray-300" size={32} />, 
      label: "Cloudy", 
      bg: "from-gray-500/20 to-zinc-500/5",
      text: "text-gray-200"
    };
    // 45-48: Fog
    if (code <= 48) return { 
      icon: <Wind className="text-zinc-400" size={32} />, 
      label: "Fog", 
      bg: "from-zinc-600/20 to-zinc-800/5",
      text: "text-zinc-300"
    };
    // 51-67: Rain / Drizzle
    if (code <= 67) return { 
      icon: <CloudRain className="text-blue-400" size={32} />, 
      label: "Rain", 
      bg: "from-blue-600/20 to-indigo-900/5",
      text: "text-blue-200"
    };
    // 71-77: Snow
    if (code <= 77) return { 
      icon: <CloudSnow className="text-cyan-200" size={32} />, 
      label: "Snow", 
      bg: "from-cyan-500/20 to-blue-900/5",
      text: "text-cyan-100"
    };
    // 80-82: Rain Showers
    if (code <= 82) return { 
      icon: <CloudRain className="text-blue-300" size={32} />, 
      label: "Showers", 
      bg: "from-blue-500/20 to-blue-900/5",
      text: "text-blue-200"
    };
    // 95-99: Thunderstorm
    return { 
      icon: <CloudLightning className="text-yellow-400" size={32} />, 
      label: "Storm", 
      bg: "from-yellow-600/20 to-purple-900/5",
      text: "text-yellow-100"
    };
  };

  // Open-Meteo APIからデータ取得
  useEffect(() => {
    const fetchWeather = async () => {
      // Get latest location directly from store to avoid dependency loop
      const loc = useNavStore.getState().currentLocation;
      if (!loc) return;
      
      setLoading(true);
      try {
        const { lat, lng } = loc;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.current_weather) {
          setWeather({
            temperature: data.current_weather.temperature,
            weatherCode: data.current_weather.weathercode,
            windSpeed: data.current_weather.windspeed,
            isDay: data.current_weather.is_day === 1
          });
        }
      } catch (error) {
        console.error("Weather fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // 10分ごとに更新
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  // デフォルト設定
  const config = weather 
    ? getWeatherConfig(weather.weatherCode, weather.isDay) 
    : { icon: <Sun className="text-zinc-600" size={32} />, label: "--", bg: "from-zinc-800 to-zinc-900", text: "text-zinc-500" };

  return (
    <div className={`relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${config.bg} p-4 transition-colors duration-1000`}>
      {/* Background Decor */}
      <div className="absolute -right-4 -top-4 opacity-10 blur-2xl">
        <div className="h-32 w-32 rounded-full bg-current"></div>
      </div>

      <div className="flex h-full flex-col justify-between relative z-10">
        
        {/* Header: Location & Status */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
              <MapPin size={10} />
              <span>Location</span>
            </div>
            <span className="text-xs font-medium text-white/80 truncate max-w-[120px]">
              {currentAreaText}
            </span>
          </div>
          
          {loading ? (
             <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-600 border-t-transparent" />
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={config.label} 
            >
              {config.icon}
            </motion.div>
          )}
        </div>

        {/* Main Info: Temp */}
        <div className="flex flex-col items-end">
          <AnimatePresence mode="wait">
            {weather ? (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-right"
              >
                <div className="flex items-start justify-end">
                  <span className="text-4xl md:text-5xl font-black text-white font-display tracking-tighter">
                    {Math.round(weather.temperature)}
                  </span>
                  <span className="text-lg text-zinc-400 font-bold mt-1">°C</span>
                </div>
                <div className={`text-sm font-bold ${config.text} uppercase tracking-widest`}>
                  {config.label}
                </div>
              </motion.div>
            ) : (
              <span className="text-zinc-600 text-sm">Searching...</span>
            )}
          </AnimatePresence>
        </div>

        {/* Footer: Wind */}
        {weather && (
          <div className="flex gap-4 mt-2 border-t border-white/5 pt-2">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Wind size={14} />
              <span className="text-xs font-mono">{weather.windSpeed} km/h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};