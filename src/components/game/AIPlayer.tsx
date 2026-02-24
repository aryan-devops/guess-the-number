
"use client"
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Zap } from 'lucide-react';

interface AIPlayerProps {
  currentMin: number;
  currentMax: number;
  difficulty: 'easy' | 'medium' | 'hard';
  totalAttempts: number;
  maxAttempts: number;
  onGuess: (guess: number, reasoning: string) => void;
  isActive: boolean;
}

export const AIPlayer = ({ 
  currentMin, 
  currentMax, 
  difficulty, 
  totalAttempts, 
  maxAttempts, 
  onGuess,
  isActive 
}: AIPlayerProps) => {
  const [isThinking, setIsThinking] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState('');
  const lastProcessedTurn = useRef(-1);

  useEffect(() => {
    // Only trigger if active and we haven't processed this specific turn count yet
    if (isActive && !isThinking && totalAttempts !== lastProcessedTurn.current) {
      const triggerGuess = async () => {
        setIsThinking(true);
        lastProcessedTurn.current = totalAttempts;
        
        // Phase 1: Initializing
        setCurrentReasoning("Analyzing range data...");
        await new Promise(r => setTimeout(r, 800));
        
        // Phase 2: Calculating
        setCurrentReasoning("Synthesizing optimal trajectory...");
        await new Promise(r => setTimeout(r, 1000));

        let guess: number;
        let reasoning: string;

        if (difficulty === 'easy') {
          // Easy: Random guess with slight bias towards center
          const range = currentMax - currentMin;
          const random = Math.random();
          guess = Math.floor(currentMin + (range * random));
          reasoning = "I'm going with a hunch on this sector!";
        } else if (difficulty === 'medium') {
          // Medium: Solid binary search
          guess = Math.floor((currentMin + currentMax) / 2);
          reasoning = `The midpoint of ${currentMin}-${currentMax} yields the highest elimination rate.`;
        } else {
          // Hard: Precise calculation
          guess = Math.floor((currentMin + currentMax) / 2);
          reasoning = `Mathematically verified: ${guess} splits the remaining uncertainty precisely in half.`;
        }

        // Ensure valid integer
        guess = Math.max(currentMin, Math.min(currentMax, Math.round(guess)));
        
        setCurrentReasoning(reasoning);
        await new Promise(r => setTimeout(r, 700));

        onGuess(guess, reasoning);
        setIsThinking(false);
      };

      triggerGuess();
    }
  }, [isActive, currentMin, currentMax, difficulty, totalAttempts, onGuess, isThinking]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          initial={{ opacity: 0, y: 50, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          className="fixed bottom-10 right-10 z-50 pointer-events-none"
        >
          <div className="glass-card p-5 rounded-3xl flex flex-col gap-4 border-accent/40 shadow-[0_0_30px_rgba(115,233,255,0.2)] max-w-xs">
            <div className="flex items-center gap-3">
              <div className="bg-accent/20 p-2.5 rounded-2xl relative">
                <Bot className="w-6 h-6 text-accent" />
                {isThinking && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-accent/40 rounded-2xl"
                  />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">CyberBot-v1</p>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-accent rounded-full animate-pulse [animation-delay:0.2s]" />
                  </div>
                </div>
                <p className="text-sm font-bold text-white leading-tight">
                  {isThinking ? "PROBABILITY SCAN..." : "TURN_INITIALIZED"}
                </p>
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                <Cpu className="w-3 h-3" /> Processing Logic
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed min-h-[3em]">
                {currentReasoning || "Awaiting neural synchronization..."}
              </p>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                 <Zap className="w-3 h-3 text-accent fill-accent" />
                 <span className="text-[9px] font-black text-accent uppercase">Active Analysis</span>
               </div>
               <div className="flex gap-1">
                 {[1, 2, 3].map(i => (
                   <motion.div 
                     key={i}
                     animate={{ height: [4, 12, 4] }}
                     transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                     className="w-1 bg-accent/50 rounded-full"
                   />
                 ))}
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
