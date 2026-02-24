
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuessDial } from './GuessDial';
import { HistoryPanel } from './HistoryPanel';
import { AIPlayer } from './AIPlayer';
import { VictoryScreen } from './VictoryScreen';
import { generateSecretNumber, getHint } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Timer, Hash, MessageSquare, Send, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GameContainerProps {
  mode: 'multiplayer' | 'practice';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const GameContainer = ({ mode, difficulty = 'medium' }: GameContainerProps) => {
  // Game Setup
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [secretNumber, setSecretNumber] = useState(0);
  const [currentGuess, setCurrentGuess] = useState(50);
  const [guesses, setGuesses] = useState<any[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  
  // Players and Turn
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [playerName] = useState('Player 1');
  const [oppName] = useState(mode === 'practice' ? 'AI Bot' : 'Waiting...');

  // Range Narrowing
  const [currentRange, setCurrentRange] = useState({ min: 1, max: 100 });

  const startNewGame = useCallback(() => {
    const secret = generateSecretNumber(min, max);
    setSecretNumber(secret);
    setGuesses([]);
    setIsGameOver(false);
    setWinner('');
    setIsPlayerTurn(true);
    setTimeLeft(15);
    setCurrentRange({ min, max });
    setCurrentGuess(Math.floor((min + max) / 2));
  }, [min, max]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Turn Timer
  useEffect(() => {
    if (isGameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time out logic
          handleGuess(Math.floor(Math.random() * (currentRange.max - currentRange.min + 1)) + currentRange.min, true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlayerTurn, isGameOver, currentRange]);

  const handleGuess = (val: number, isAuto = false) => {
    const hint = getHint(val, secretNumber);
    const newRecord = {
      value: val,
      hint,
      timestamp: Date.now(),
      player: isPlayerTurn ? playerName : oppName,
      isAuto
    };

    setGuesses(prev => [...prev, newRecord]);

    if (hint === 'Too High') {
      setCurrentRange(prev => ({ ...prev, max: Math.min(prev.max, val - 1) }));
    } else if (hint === 'Too Low') {
      setCurrentRange(prev => ({ ...prev, min: Math.max(prev.min, val + 1) }));
    }

    if (hint === 'Correct') {
      setWinner(isPlayerTurn ? playerName : oppName);
      setIsGameOver(true);
    } else {
      setIsPlayerTurn(!isPlayerTurn);
      setTimeLeft(15);
    }
  };

  return (
    <div className="relative min-h-screen pt-10 pb-20 px-4 md:px-10 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-all duration-500 ${isPlayerTurn ? 'glass-card border-primary/50 glow-magenta' : 'opacity-40'}`}>
            <p className="text-[10px] uppercase font-bold text-primary tracking-tighter">Your Turn</p>
            <h2 className="text-xl font-headline text-white">{playerName}</h2>
          </div>
          <div className="text-2xl font-black text-muted-foreground">VS</div>
          <div className={`p-3 rounded-2xl transition-all duration-500 ${!isPlayerTurn ? 'glass-card border-accent/50 glow-cyan' : 'opacity-40'}`}>
            <p className="text-[10px] uppercase font-bold text-accent tracking-tighter">Opponent Turn</p>
            <h2 className="text-xl font-headline text-white">{oppName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Time</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
            <Progress value={(timeLeft / 15) * 100} className="w-24 h-1 bg-white/10 mt-2" />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-accent" />
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Target Range</span>
            </div>
            <div className="text-xl font-bold text-white">
              {currentRange.min} — {currentRange.max}
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: History & Chat */}
        <div className="lg:col-span-3 space-y-6 h-[500px] flex flex-col">
          <HistoryPanel guesses={guesses} />
          
          <div className="glass-card rounded-2xl p-4 flex-1 border-white/5 flex flex-col">
             <div className="flex items-center gap-2 mb-4">
               <MessageSquare className="w-4 h-4 text-primary" />
               <h3 className="text-xs font-semibold uppercase tracking-widest">In-game Chat</h3>
             </div>
             <div className="flex-1 bg-black/20 rounded-xl mb-3 p-3 text-xs text-muted-foreground italic flex items-center justify-center">
               Room chat coming soon...
             </div>
             <div className="flex gap-2">
               <Input className="bg-white/5 border-white/10 rounded-lg h-8 text-xs" placeholder="Type..." />
               <Button size="icon" className="h-8 w-8 bg-primary rounded-lg">
                 <Send className="w-3 h-3" />
               </Button>
             </div>
          </div>
        </div>

        {/* Center: Interaction */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="mb-10 w-full relative">
             <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
             <div className="relative">
                <GuessDial 
                  min={currentRange.min} 
                  max={currentRange.max} 
                  value={currentGuess} 
                  onChange={setCurrentGuess}
                  disabled={!isPlayerTurn || isGameOver}
                />
             </div>
          </div>

          <Button 
            onClick={() => handleGuess(currentGuess)} 
            disabled={!isPlayerTurn || isGameOver}
            className="w-full max-w-xs h-16 bg-primary hover:bg-primary/90 rounded-2xl text-xl font-bold glow-magenta group"
          >
            <motion.span whileTap={{ scale: 0.95 }}>SUBMIT GUESS</motion.span>
          </Button>

          <p className="mt-6 text-muted-foreground text-sm flex items-center gap-2">
             <Users className="w-4 h-4" />
             {mode === 'practice' ? 'Practice Mode' : 'Online Match'} • {difficulty.toUpperCase()}
          </p>
        </div>

        {/* Right Side: Stats & Progression */}
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-2xl p-6 border-white/5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Rank: Novice</span>
                    <span className="text-primary">XP: 450/1000</span>
                  </div>
                  <Progress value={45} className="h-2 bg-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase">Streak</p>
                    <p className="text-xl font-bold text-white">3 🔥</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase">Badges</p>
                    <p className="text-xl font-bold text-white">12 🏆</p>
                  </div>
                </div>
              </div>
           </div>

           <div className="glass-card rounded-2xl p-6 border-white/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                 <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">LATEST</Badge>
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Match Feedback</h3>
              <AnimatePresence mode="wait">
                {guesses.length > 0 ? (
                  <motion.div 
                    key={guesses[guesses.length - 1].timestamp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <p className="text-white text-center font-medium italic">
                      "{guesses[guesses.length - 1].hint}!"
                    </p>
                    {guesses[guesses.length - 1].hint === 'Too High' && (
                      <div className="text-destructive animate-bounce">
                        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity }}>
                          <span className="text-4xl font-bold">↓</span>
                        </motion.div>
                      </div>
                    )}
                    {guesses[guesses.length - 1].hint === 'Too Low' && (
                      <div className="text-accent animate-bounce">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity }}>
                          <span className="text-4xl font-bold">↑</span>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center">Take a guess to see hints!</p>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* AI Bot Component (Hidden logic, provides guesses) */}
      {mode === 'practice' && (
        <AIPlayer 
          currentMin={currentRange.min}
          currentMax={currentRange.max}
          difficulty={difficulty}
          totalAttempts={guesses.filter(g => g.player === oppName).length}
          maxAttempts={20}
          isActive={!isPlayerTurn && !isGameOver}
          onGuess={handleGuess}
        />
      )}

      {/* Celebration Overlays */}
      <AnimatePresence>
        {isGameOver && (
          <VictoryScreen 
            winnerName={winner} 
            secretNumber={secretNumber} 
            totalAttempts={guesses.length}
            onRematch={startNewGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
