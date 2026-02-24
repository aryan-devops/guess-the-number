
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
import { Timer, Hash, MessageSquare, Send, Users, Lock, Unlock, PlayCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GameContainerProps {
  mode: 'multiplayer' | 'practice';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const GameContainer = ({ mode, difficulty = 'medium' }: GameContainerProps) => {
  // Game Setup Phase
  const [isSettingSecret, setIsSettingSecret] = useState(true);
  const [customSecret, setCustomSecret] = useState<string>('');
  
  // Game State
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
  const [playerName] = useState('You');
  const [oppName] = useState(mode === 'practice' ? 'CyberBot-v1' : 'Waiting...');

  // Range Narrowing
  const [currentRange, setCurrentRange] = useState({ min: 1, max: 100 });

  const startNewGame = useCallback(() => {
    setIsSettingSecret(true);
    setCustomSecret('');
    setGuesses([]);
    setIsGameOver(false);
    setWinner('');
    setIsPlayerTurn(true);
    setTimeLeft(15);
    setCurrentRange({ min: 1, max: 100 });
    setCurrentGuess(50);
  }, []);

  const confirmSecretAndStart = () => {
    let secret = parseInt(customSecret);
    if (isNaN(secret) || secret < min || secret > max) {
      secret = generateSecretNumber(min, max);
    }
    
    setSecretNumber(secret);
    setIsSettingSecret(false);
    // If player sets the number, the AI goes first
    setIsPlayerTurn(false);
    setTimeLeft(15);
  };

  const skipSetupAndGuess = () => {
    const secret = generateSecretNumber(min, max);
    setSecretNumber(secret);
    setIsSettingSecret(false);
    setIsPlayerTurn(true); // Player starts guessing
    setTimeLeft(15);
  };

  useEffect(() => {
    if (isGameOver || isSettingSecret) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleGuess(Math.floor(Math.random() * (currentRange.max - currentRange.min + 1)) + currentRange.min, true);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlayerTurn, isGameOver, isSettingSecret, currentRange]);

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
      {/* Game Setup Phase UI */}
      <AnimatePresence>
        {isSettingSecret && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
          >
            <div className="glass-card w-full max-w-md p-8 rounded-3xl border-primary/20 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black font-headline text-white uppercase tracking-tighter">
                  MATCH <span className="text-primary neon-magenta">SETUP</span>
                </h2>
                <p className="text-sm text-muted-foreground">Choose your challenge mode for this session.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    Set Secret Number (1-100)
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      type="number"
                      value={customSecret}
                      onChange={(e) => setCustomSecret(e.target.value)}
                      placeholder="RANDOM"
                      className="pl-10 h-12 bg-black/20 border-white/10 text-xl font-bold text-center text-primary focus:border-primary/50"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
                    Leave empty for a computer-generated random number.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={confirmSecretAndStart}
                    className="h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl glow-magenta"
                  >
                    <Unlock className="w-5 h-5 mr-2" /> CHALLENGE THE BOT
                  </Button>
                  <div className="relative flex items-center py-2">
                    <div className="flex-1 border-t border-white/10"></div>
                    <span className="px-3 text-[10px] font-bold text-muted-foreground">OR</span>
                    <div className="flex-1 border-t border-white/10"></div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={skipSetupAndGuess}
                    className="h-14 border-accent/30 text-accent hover:bg-accent/10 font-bold rounded-xl"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" /> I WANT TO GUESS
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl transition-all duration-500 relative ${isPlayerTurn ? 'glass-card border-primary/50 glow-magenta' : 'opacity-40 grayscale'}`}>
            <p className="text-[10px] uppercase font-bold text-primary tracking-tighter">Your Turn</p>
            <h2 className="text-xl font-headline text-white">{playerName}</h2>
            {isPlayerTurn && <motion.div layoutId="turn-indicator" className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />}
          </div>
          <div className="text-2xl font-black text-muted-foreground">VS</div>
          <div className={`p-4 rounded-2xl transition-all duration-500 relative ${!isPlayerTurn ? 'glass-card border-accent/50 glow-cyan shadow-[0_0_20px_rgba(115,233,255,0.2)]' : 'opacity-40 grayscale'}`}>
            <p className="text-[10px] uppercase font-bold text-accent tracking-tighter">Opponent Turn</p>
            <h2 className="text-xl font-headline text-white">{oppName}</h2>
            {!isPlayerTurn && <motion.div layoutId="turn-indicator" className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Time Remaining</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white tracking-widest">
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
            <Progress value={(timeLeft / 15) * 100} className="w-24 h-1.5 bg-white/5 mt-2 overflow-hidden rounded-none" />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-accent" />
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Deduction Range</span>
            </div>
            <div className="text-xl font-bold text-white bg-white/5 px-4 py-1 rounded-lg border border-white/10">
              <span className="text-muted-foreground font-light">{currentRange.min}</span>
              <span className="mx-2 text-accent">↔</span>
              <span className="text-muted-foreground font-light">{currentRange.max}</span>
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
               <h3 className="text-xs font-semibold uppercase tracking-widest">Neural Link</h3>
             </div>
             <div className="flex-1 bg-black/20 rounded-xl mb-3 p-3 text-xs text-muted-foreground italic flex items-center justify-center text-center">
               Monitoring encrypted transmission...
             </div>
             <div className="flex gap-2">
               <Input className="bg-white/5 border-white/10 rounded-lg h-8 text-xs focus:ring-1 ring-primary/30" placeholder="Type..." />
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
                  disabled={!isPlayerTurn || isGameOver || isSettingSecret}
                />
             </div>
          </div>

          <div className="w-full flex flex-col items-center gap-6">
            <Button 
              onClick={() => handleGuess(currentGuess)} 
              disabled={!isPlayerTurn || isGameOver || isSettingSecret}
              className={`w-full max-w-xs h-16 rounded-2xl text-xl font-bold group relative overflow-hidden transition-all duration-300 ${
                isPlayerTurn ? 'bg-primary hover:bg-primary/90 glow-magenta' : 'bg-muted border border-white/5 text-muted-foreground cursor-not-allowed'
              }`}
            >
              <motion.span whileTap={{ scale: 0.95 }} className="relative z-10">
                {isPlayerTurn ? 'SUBMIT GUESS' : 'WAITING FOR BOT...'}
              </motion.span>
              {!isPlayerTurn && !isGameOver && (
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-accent/10 z-0"
                />
              )}
            </Button>

            {!isPlayerTurn && !isGameOver && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-6 py-3 rounded-2xl"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-accent font-bold uppercase tracking-widest">CyberBot is calculating probabilities...</span>
              </motion.div>
            )}
          </div>

          <p className="mt-8 text-muted-foreground text-sm flex items-center gap-2 font-medium opacity-60">
             <Users className="w-4 h-4" />
             {mode === 'practice' ? 'Practice Instance' : 'Sync Active'} • {difficulty.toUpperCase()} • ENCRYPTED
          </p>
        </div>

        {/* Right Side: Stats & Progression */}
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-2xl p-6 border-white/5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Dossier: {playerName}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-tighter">
                    <span>Rank: Novice Agent</span>
                    <span className="text-primary">XP: 450/1000</span>
                  </div>
                  <Progress value={45} className="h-1.5 bg-white/5 rounded-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Winning Streak</p>
                    <p className="text-xl font-bold text-white">3 🔥</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Achievements</p>
                    <p className="text-xl font-bold text-white">12 🏆</p>
                  </div>
                </div>
              </div>
           </div>

           <div className="glass-card rounded-2xl p-6 border-white/5 overflow-hidden relative min-h-[160px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-2">
                 <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 text-[9px]">REAL-TIME FEEDBACK</Badge>
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Neural Feedback</h3>
              <AnimatePresence mode="wait">
                {guesses.length > 0 ? (
                  <motion.div 
                    key={guesses[guesses.length - 1].timestamp}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">{guesses[guesses.length - 1].player} guessed {guesses[guesses.length - 1].value}</p>
                      <p className="text-xl font-black text-white italic tracking-tighter">
                        "{guesses[guesses.length - 1].hint.toUpperCase()}!"
                      </p>
                    </div>
                    {guesses[guesses.length - 1].hint === 'Too High' && (
                      <div className="text-destructive flex flex-col items-center">
                        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          <span className="text-4xl font-black">↓</span>
                        </motion.div>
                        <span className="text-[9px] font-bold uppercase">Lower Target</span>
                      </div>
                    )}
                    {guesses[guesses.length - 1].hint === 'Too Low' && (
                      <div className="text-accent flex flex-col items-center">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          <span className="text-4xl font-black">↑</span>
                        </motion.div>
                        <span className="text-[9px] font-bold uppercase">Higher Target</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center">Establish first guess to initialize feedback stream.</p>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* AI Bot Component */}
      {mode === 'practice' && (
        <AIPlayer 
          currentMin={currentRange.min}
          currentMax={currentRange.max}
          difficulty={difficulty}
          totalAttempts={guesses.filter(g => g.player === oppName).length}
          maxAttempts={20}
          isActive={!isPlayerTurn && !isGameOver && !isSettingSecret}
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
