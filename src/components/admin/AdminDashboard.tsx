import React from 'react';
import { Cpu, HardDrive, Wifi, Battery, Activity, Trash2 } from 'lucide-react';
import { useNavStore } from '../../store/useNavStore';
import { ProCard } from '../ui/ProCard';

export const AdminDashboard: React.FC = () => {
  const { resetAllData, refreshRouteData } = useNavStore();

  const handleFactoryReset = () => {
      if(window.confirm('Factory Reset?')) {
          resetAllData();
      }
  };

  return (
    <div className="h-full bg-black text-white p-6 overflow-y-auto pb-32">
      <h2 className="text-[34px] font-bold tracking-tight mb-8">System Admin</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <ProCard className="p-4 flex flex-col items-center gap-2 bg-zinc-900/50"><Cpu size={24} className="text-blue-500" /><span className="text-xs font-bold text-zinc-500">CPU LOAD</span><span className="text-xl font-mono">12%</span></ProCard>
        <ProCard className="p-4 flex flex-col items-center gap-2 bg-zinc-900/50"><HardDrive size={24} className="text-purple-500" /><span className="text-xs font-bold text-zinc-500">STORAGE</span><span className="text-xl font-mono">45%</span></ProCard>
        <ProCard className="p-4 flex flex-col items-center gap-2 bg-zinc-900/50"><Wifi size={24} className="text-green-500" /><span className="text-xs font-bold text-zinc-500">NETWORK</span><span className="text-xl font-mono">5G</span></ProCard>
        <ProCard className="p-4 flex flex-col items-center gap-2 bg-zinc-900/50"><Battery size={24} className="text-yellow-500" /><span className="text-xs font-bold text-zinc-500">POWER</span><span className="text-xl font-mono">100%</span></ProCard>
      </div>
      <h3 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-3">Maintenance</h3>
      <div className="space-y-3">
        <ProCard onClick={() => refreshRouteData()} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"><span className="font-medium">Force Sync Route Data</span><Activity size={16} className="text-blue-500" /></ProCard>
        <ProCard onClick={handleFactoryReset} className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-900/20 border-red-900/30"><span className="font-medium text-red-400">Factory Reset</span><Trash2 size={16} className="text-red-500" /></ProCard>
      </div>
    </div>
  );
};
