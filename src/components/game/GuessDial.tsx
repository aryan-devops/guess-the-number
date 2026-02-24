
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuessDialProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const GuessDial = ({ min, max, value, onChange, disabled }: GuessDialProps) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const increment = () => {
    if (disabled) return;
    const next = Math.min(max, inputValue + 1);
    setInputValue(next);
    onChange(next);
  };

  const decrement = () => {
    if (disabled) return;
    const next = Math.max(min, inputValue - 1);
    setInputValue(next);
    onChange(next);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500" />
        <div className="relative flex flex-col items-center glass-card p-8 rounded-3xl w-48 h-64 justify-between border-primary/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={increment}
            disabled={disabled || inputValue >= max}
            className="text-primary hover:bg-primary/10 rounded-full h-12 w-12"
          >
            <ChevronUp className="w-8 h-8" />
          </Button>

          <div className="flex flex-col items-center justify-center h-24 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={inputValue}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-6xl font-bold font-headline tracking-tighter text-white neon-magenta"
              >
                {inputValue}
              </motion.div>
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={decrement}
            disabled={disabled || inputValue <= min}
            className="text-primary hover:bg-primary/10 rounded-full h-12 w-12"
          >
            <ChevronDown className="w-8 h-8" />
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2">
        {[1, 10, 50].map(step => (
          <Button
            key={step}
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => {
              const next = Math.min(max, inputValue + step);
              setInputValue(next);
              onChange(next);
            }}
            className="border-primary/30 hover:bg-primary/20 text-xs"
          >
            +{step}
          </Button>
        ))}
      </div>
    </div>
  );
};
