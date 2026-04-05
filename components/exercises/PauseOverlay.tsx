import React from 'react';
import { motion } from 'framer-motion';

export const PauseOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
      <div className="text-center space-y-8">
        <h2 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">Rest Your Eyes</h2>
        <div className="flex gap-12 justify-center">
          {/* Eye 1 */}
          <EyeAnimation />
          {/* Eye 2 */}
          <EyeAnimation />
        </div>
        <div className="text-white/80 font-medium animate-pulse">Blink actively...</div>
      </div>
    </div>
  );
};

const EyeAnimation = () => (
  <motion.div
    className="w-24 h-24 bg-white rounded-full relative overflow-hidden shadow-2xl border-4 border-white/20"
    initial={{ scaleY: 1 }}
    animate={{ scaleY: [1, 0.05, 1] }}
    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
  >
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/40 rounded-full blur-[1px]" />
    </motion.div>
  </motion.div>
);
