import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import beep2 from '@/assets/audio/beep-002.wav';
import beep3 from '@/assets/audio/beep-003.wav';

interface TimerBarProps {
  duration: number; // in seconds
  onComplete?: () => void;
  isRunning: boolean;
}

export const TimerBar: React.FC<TimerBarProps> = ({ duration, onComplete, isRunning }) => {
  const [progress, setProgress] = useState(1);
  const lastPlayedRef = useRef<number | null>(null);

  const timeLeft = Math.ceil(progress * duration);

  useEffect(() => {
    if (isRunning) {
      const isSoundEnabled = localStorage.getItem('local:sounds_enabled') !== 'false';
      
      const playSound = (audioPath: string) => {
        if (isSoundEnabled) {
          new Audio(audioPath).play().catch(console.warn);
        }
      };

      if (timeLeft === 5 && lastPlayedRef.current !== 5) {
        playSound(beep2);
        lastPlayedRef.current = 5;
      } else if (timeLeft === 3 && lastPlayedRef.current !== 3) {
        playSound(beep2);
        lastPlayedRef.current = 3;
      } else if (timeLeft === 1 && lastPlayedRef.current !== 1) {
        playSound(beep3);
        lastPlayedRef.current = 1;
      }
    } else {
      lastPlayedRef.current = null;
    }
  }, [timeLeft, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.max(0, 1 - elapsed / (duration * 1000));
      setProgress(newProgress);

      if (newProgress === 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration, isRunning, onComplete]);

  return (
    <div className="fixed top-6 right-6 z-50 w-full max-w-[200px] flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Time Left</span>
        <span className="text-xs font-mono font-bold text-primary-600">{timeLeft}s</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-indigo-600"
          initial={{ width: '100%' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: "linear" }}
        />
      </div>
    </div>
  );
};
