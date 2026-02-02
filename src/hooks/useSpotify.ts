import { useState } from 'react';

interface Artist { name: string; }
interface Image { url: string; }
interface Album { images: Image[]; }
export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
}

// APIキー取得前用のダミーフック
export const useSpotify = () => {
  // 常に「未接続」状態を返す
  const [token] = useState<string | null>(null);
  const [track] = useState<Track | null>(null);
  const [isPlaying] = useState(false);

  const handleLogin = () => {
    alert("Spotify Client IDが設定されていません。開発者モードを確認してください。");
  };

  const handleNext = () => {
    console.log("Next track (Mock)");
  };

  const handlePlayPause = () => {
    console.log("Play/Pause (Mock)");
  };

  return { token, track, isPlaying, handleLogin, handleNext, handlePlayPause };
};