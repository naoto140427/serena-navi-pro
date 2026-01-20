import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CockpitPage } from './pages/CockpitPage';
import { CoPilotPage } from './pages/CoPilotPage';
import { BootSequence } from './components/layout/BootSequence';
import { UserSelector } from './components/layout/UserSelector';
import { useNavStore } from './store/useNavStore';
import { useWakeLock } from './hooks/useWakeLock';

function AppContent() {
  const { initializeSync } = useNavStore();
  
  // ★ 開発中は false に設定して演出をスキップ
  const [isBooting, setIsBooting] = useState(false); 
  const [isUserSelected, setIsUserSelected] = useState(true);

  useWakeLock();

  useEffect(() => {
    initializeSync();
  }, [initializeSync]);

  const handleBootComplete = () => setIsBooting(false);
  const handleUserSelected = () => setIsUserSelected(true);

  return (
    <div className="w-full h-screen bg-black overflow-hidden font-sans">
      
      <AnimatePresence>
        {isBooting && <BootSequence onComplete={handleBootComplete} />}
      </AnimatePresence>

      {!isBooting && !isUserSelected && (
        <UserSelector onSelect={handleUserSelected} />
      )}

      {!isBooting && isUserSelected && (
        <Routes>
          <Route path="/" element={<CockpitPage />} />
          <Route path="/copilot" element={<CoPilotPage />} />
        </Routes>
      )}
      
      {/* Dev Menu */}
      <div className="fixed bottom-0 right-0 p-2 opacity-50 hover:opacity-100 z-50 flex gap-2 text-xs text-zinc-500 pointer-events-auto">
         <Link to="/">Cockpit</Link>
         |
         <Link to="/copilot">Co-Pilot</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;