import { useState, useEffect } from 'react';
import { CockpitPage } from './pages/CockpitPage';
import { CoPilotPage } from './pages/CoPilotPage';
import { PassengerHub } from './pages/PassengerHub';
import { ModeSelectPage } from './pages/ModeSelectPage';
import { JournalPage } from './pages/JournalPage';
import { useNavStore } from './store/useNavStore';
import { Layout } from './components/layout/Layout';
import { BootSequence } from './components/layout/BootSequence';
import { useWakeLock } from './hooks/useWakeLock';
import { GPSWatcher } from './components/widgets/GPSWatcher';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  useWakeLock();
  
  // Storeから必要なものだけを取り出す
  const { mode, initializeSync, appMode, setAppMode } = useNavStore();
  
  const [booted, setBooted] = useState(false);

  // アプリ起動時のデータ同期
  useEffect(() => {
    initializeSync();
  }, [initializeSync]);

  if (!booted) {
    return (
      <>
        <BootSequence onComplete={() => setBooted(true)} />
        <SpeedInsights />
      </>
    );
  }

  // ランチャー画面
  if (appMode === 'launcher') {
    return (
      <>
        <ModeSelectPage onSelectMode={(m) => setAppMode(m)} />
        <SpeedInsights />
      </>
    );
  }

  // ジャーナルモード
  if (appMode === 'journal') {
    return (
      <>
        <JournalPage />
        <SpeedInsights />
      </>
    );
  }

  // ナビゲーションモード (Cockpit / CoPilot / Passenger)
  return (
    <>
      <Layout>
        {/* 位置情報監視はNavigationモードでのみ有効にする */}
        <GPSWatcher />
        
        {mode === 'driver' ? <CockpitPage /> : 
         mode === 'passenger' ? <PassengerHub /> : 
         <CoPilotPage />}
      </Layout>
      <SpeedInsights />
    </>
  );
}

export default App;
