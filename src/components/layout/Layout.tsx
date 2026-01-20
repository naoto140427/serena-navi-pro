import React from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';
import { DynamicIsland } from '../widgets/DynamicIsland'; // ← 追加

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      
      {/* Dynamic Island をここに追加（最前面） */}
      <DynamicIsland />

      <main className="pb-20"> 
        <Outlet />
      </main>
      
      <TabBar />
    </div>
  );
};