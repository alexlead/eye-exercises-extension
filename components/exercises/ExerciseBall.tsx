import React from 'react';
import { motion } from 'framer-motion';
import { TrajectoryType } from '@/utils/exercises';

interface ExerciseBallProps {
  trajectory: TrajectoryType;
  duration: number;
}

export const ExerciseBall: React.FC<ExerciseBallProps> = ({ trajectory, duration }) => {
  const animationDuration = duration / 2;


  const getVariants = () => {
    switch (trajectory) {
      case 'vertical':
        return {
          animate: {
            y: ['-48vh', '48vh'],
            transition: { duration: animationDuration / 8, repeat: Infinity, repeatType: "reverse" as any, ease: "linear" as any }
          }
        };
      case 'horizontal':
        return {
          animate: {
            x: ['-48vw', '48vw'],
            transition: { duration: animationDuration / 8, repeat: Infinity, repeatType: "reverse" as any, ease: "linear" as any }
          }
        };
      case 'diagonal1':
        return {
          animate: {
            x: ['-48vw', '48vw'],
            y: ['48vh', '-48vh'],
            transition: { duration: animationDuration / 8, repeat: Infinity, repeatType: "reverse" as any, ease: "linear" as any }
          }
        };
      case 'diagonal2':
        return {
          animate: {
            x: ['48vw', '-48vw'],
            y: ['48vh', '-48vh'],
            transition: { duration: animationDuration / 8, repeat: Infinity, repeatType: "reverse" as any, ease: "linear" as any }
          }
        };
      case 'square':
        return {
          animate: {
            x: ['-45vw', '45vw', '45vw', '-45vw', '-45vw'],
            y: ['45vh', '45vh', '-45vh', '-45vh', '45vh'],
            transition: { duration: animationDuration / 5, repeat: Infinity, ease: "linear" as any }
          }
        };
      case 'butterflyH':
        return {
          animate: {
            x: Array.from({ length: 40 }, (_, i) => 48 * Math.sin((i / 39) * 2 * Math.PI) + 'vw'),
            y: Array.from({ length: 40 }, (_, i) => 25 * Math.sin((i / 39) * 4 * Math.PI) + 'vh'),
            transition: { duration: animationDuration / 5, repeat: Infinity, ease: "linear" as any }
          }
        };
      case 'butterflyV':
        return {
          animate: {
            x: Array.from({ length: 40 }, (_, i) => 25 * Math.sin((i / 39) * 4 * Math.PI) + 'vw'),
            y: Array.from({ length: 40 }, (_, i) => 48 * Math.sin((i / 39) * 2 * Math.PI) + 'vh'),
            transition: { duration: animationDuration / 5, repeat: Infinity, ease: "linear" as any }
          }
        };
      case 'circleCW':
        return {
          animate: {
            x: Array.from({ length: 40 }, (_, i) => 45 * Math.cos((i / 39) * 2 * Math.PI) + 'vw'),
            y: Array.from({ length: 40 }, (_, i) => 45 * Math.sin((i / 39) * 2 * Math.PI) + 'vh'),
            transition: { duration: animationDuration / 3, repeat: Infinity, ease: "linear" as any }
          }
        };
      case 'zigzag':
        return {
          animate: {
            x: [
              '-48vw', '48vw',
              '-48vw', '48vw',
              '-48vw', '48vw',
              '-48vw'
            ],
            y: [
              '-45vh', '-30vh',
              '-15vh', '0vh',
              '15vh', '30vh',
              '45vh'
            ],
            transition: { duration: animationDuration / 2, repeat: Infinity, repeatType: "reverse" as any, ease: "linear" as any }
          }
        };
      case 'zigzagH':
        const zigzagPoints = 15
        return {
          animate: {
            x: ['-45vw', '45vw'],
            y: Array.from({ length: zigzagPoints }, (_, i) =>
              i % 2 === 0 ? '-48vh' : '48vh'
            ),

            transition: {
              duration: animationDuration / 2,
              repeat: Infinity,
              repeatType: "reverse" as any,
              ease: "linear" as any
            }
          }
        };

      case 'globe':
        return {
          animate: {
            x: ['0vw', '48vw', '0vw', '-48vw', '0vw'],
            scale: [2, 1, 0.5, 1, 2],
            zIndex: [2, 1, 0, 1, 2],
            transition: {
              duration: animationDuration / 3,
              repeat: Infinity,
              ease: "linear" as any
            }
          }
        };
      default:
        return {
          animate: { scale: [1, 1.2, 1], transition: { duration: 2, repeat: Infinity, ease: "linear" as any } }
        };
    }
  };

  const variants = getVariants();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* The Ball */}
      <motion.div
        className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-indigo-600 shadow-2xl z-10"
        initial={{ x: 0, y: 0 }}
        {...variants}
      >
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/40 rounded-full blur-sm" />
      </motion.div>

      {/* Visual Guide (Optional - subtle path) */}
      <div className="absolute center w-4 h-4 rounded-full border-2 border-primary-200 opacity-20" />
    </div>
  );
};
