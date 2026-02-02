import React from 'react';
import { WalletWidget } from '../components/widgets/WalletWidget';

export const WalletPage: React.FC = () => {
  return (
    <div className="h-full bg-black">
      <WalletWidget className="h-full p-6" />
    </div>
  );
};