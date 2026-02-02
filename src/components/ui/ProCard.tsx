import React from 'react';
import { motion } from 'framer-motion';

interface ProCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noBlur?: boolean;
}

export const ProCard: React.FC<ProCardProps> = ({
  children,
  className = "",
  onClick,
  noBlur = false
}) => (
  <motion.div
    onClick={onClick}
    whileTap={onClick ? { scale: 0.98 } : undefined}
    className={`relative overflow-hidden rounded-[24px] border border-white/10 shadow-2xl ${noBlur ? 'bg-[#000000]' : 'bg-[#161618]/90 backdrop-blur-3xl'} ${className}`}
  >
    {children}
  </motion.div>
);
