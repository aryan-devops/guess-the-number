"use client"
import React, { useEffect, useState } from 'react';
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
        // Simulate thinking time for realism
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
        
        // Local AI Logic (Replaces Genkit Flow)
        let guess: number;
        let reasoning: string;

        if (difficulty === 'easy') {
          // Easy: Random guess in the current known range
          guess = Math.floor(Math.random() * (currentMax - currentMin + 1)) + currentMin;
          reasoning = "I'm feeling lucky with this random pick!";
        } else if (difficulty === 'medium') {
          // Medium: Binary search (middle point)
          guess = Math.floor((currentMin + currentMax) / 2);
          reasoning = "Targeting the midpoint to narrow down the possibilities.";
        } else {
          // Hard: Optimized binary search with specific commentary
          guess = Math.floor((currentMin + currentMax) / 2);
          reasoning = `Based on the range ${currentMin}-${currentMax}, ${guess} is the mathematically optimal choice to eliminate half the remaining numbers.`;
        }

        // Ensure guess is valid (integers only, within range)
        guess = Math.max(currentMin, Math.min(currentMax, Math.round(guess)));
        
        onGuess(guess, reasoning);
        setIsThinking(false);
      };

      triggerGuess();
    }
  }, [isActive, currentMin, currentMax, difficulty, totalAttempts, maxAttempts, onGuess, isThinking]);

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