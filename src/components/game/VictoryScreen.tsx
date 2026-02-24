
"use client"
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface VictoryScreenProps {
  winnerName: string;
  secretNumber: number;
  totalAttempts: number;
  onRematch: () => void;
}

export const VictoryScreen = ({ winnerName, secretNumber, totalAttempts, onRematch }: VictoryScreenProps) => {
  useEffect(() => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full glass-card p-10 rounded-3xl text-center relative overflow-hidden border-primary/40">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          className="bg-primary/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 glow-magenta"
        >
          <Trophy className="w-12 h-12 text-primary" />
        </motion.div>

        <h1 className="text-4xl font-bold font-headline mb-2 neon-magenta uppercase tracking-tighter">VICTORY</h1>
        <p className="text-xl text-white mb-8">
          <span className="text-primary font-bold">{winnerName}</span> guessed the number!
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Secret Number</p>
            <p className="text-2xl font-bold text-accent">{secretNumber}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Attempts</p>
            <p className="text-2xl font-bold text-accent">{totalAttempts}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={onRematch} className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl text-lg font-bold glow-magenta">
            <RotateCcw className="w-5 h-5 mr-2" /> Play Again
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl border-white/10 hover:bg-white/5">
              <Share2 className="w-5 h-5 mr-2" /> Share
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5">
                <Home className="w-5 h-5 mr-2" /> Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
