
"use client"
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GuessRecord {
  value: number;
  hint: 'Too High' | 'Too Low' | 'Correct';
  timestamp: number;
  player: string;
}

interface HistoryPanelProps {
  guesses: GuessRecord[];
}

export const HistoryPanel = ({ guesses }: HistoryPanelProps) => {
  return (
    <div className="glass-card rounded-2xl p-4 h-full border-white/5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-2">Guess History</h3>
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {[...guesses].reverse().map((g, idx) => (
              <motion.div
                key={g.timestamp}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">{g.value}</span>
                  <span className="text-[10px] text-muted-foreground">{g.player}</span>
                </div>
                
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  g.hint === 'Too High' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                  g.hint === 'Too Low' ? 'bg-accent/20 text-accent border border-accent/30' :
                  'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {g.hint === 'Too High' && (
                    <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <ArrowDown className="w-3 h-3" />
                    </motion.div>
                  )}
                  {g.hint === 'Too Low' && (
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <ArrowUp className="w-3 h-3" />
                    </motion.div>
                  )}
                  {g.hint === 'Correct' && <Check className="w-3 h-3" />}
                  {g.hint}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {guesses.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm italic">
              No guesses yet...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
