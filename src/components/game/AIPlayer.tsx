
"use client"
import React, { useEffect, useState } from 'react';
import { guessNumberAIFlow, AiGuessInput } from '@/ai/flows/ai-opponent-practice-mode';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

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

  useEffect(() => {
    if (isActive && !isThinking) {
      const triggerGuess = async () => {
        setIsThinking(true);
        // Simulate thinking time
        await new Promise(r => setTimeout(r, 2000));
        
        try {
          const result = await guessNumberAIFlow({
            currentMin,
            currentMax,
            difficulty,
            totalAttempts,
            maxAttempts
          });
          onGuess(result.guess, result.reasoning || '');
        } catch (error) {
          console.error("AI Error:", error);
          // Fallback guess
          onGuess(Math.floor((currentMin + currentMax) / 2), "I had a glitch, so I'm guessing the middle!");
        } finally {
          setIsThinking(false);
        }
      };

      triggerGuess();
    }
  }, [isActive, currentMin, currentMax, difficulty, totalAttempts, maxAttempts, onGuess]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-10 right-10 z-50">
      <motion.div 
        animate={isThinking ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="glass-card p-4 rounded-2xl flex items-center gap-3 border-accent/30"
      >
        <div className="bg-accent/20 p-2 rounded-full">
          <Bot className="w-6 h-6 text-accent" />
        </div>
        <div>
          <p className="text-xs text-accent font-bold uppercase tracking-wider">AI Opponent</p>
          <p className="text-sm text-white">
            {isThinking ? "Calculating probabilities..." : "Waiting for your turn..."}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
