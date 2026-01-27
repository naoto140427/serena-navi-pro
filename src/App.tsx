import { useState, useEffect } from 'react';
import { useNavStore } from './store/useNavStore';
import { UserSelect } from './components/layout/UserSelect';
import { BootSequence } from './components/layout/BootSequence';
import { CockpitPage } from './pages/CockpitPage';
import { CoPilotPage } from './pages/CoPilotPage';
import { useWakeLock } from './hooks/useWakeLock';
import { GPSWatcher } from './components/widgets/GPSWatcher'; // ★追加

export const App = () => {
  const [appState, setAppState] = useState<'boot' | 'select' | 'ready'>('boot');
  const { initializeSync, mode } = useNavStore();
  const { requestWakeLock } = useWakeLock();

  useEffect(() => {
    // アプリ起動時の初期化
    initializeSync();
    
    // 起動アニメーション用のタイマー
    const timer = setTimeout(() => {
      setAppState('select');
    }, 2500);

    // 画面スリープ防止
    const handleInteraction = () => {
      requestWakeLock();
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [initializeSync, requestWakeLock]);

  // ステートによる画面切り替え
  if (appState === 'boot') {
    return <BootSequence onComplete={() => setAppState('select')} />;
  }

  if (appState === 'select') {
    return <UserSelect onSelect={() => setAppState('ready')} />;
  }

  // ★ここを変更: GPSWatcherを配置して位置情報を監視開始
  return (
    <>
      <GPSWatcher />
      {mode === 'driver' ? <CockpitPage /> : <CoPilotPage />}
    </>
  );
};