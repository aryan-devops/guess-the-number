"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryPanel } from './HistoryPanel';
import { VictoryScreen } from './VictoryScreen';
import { getHint } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Timer, Hash, MessageSquare, Send, Users, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, updateDoc, collection, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface DuelGameContainerProps {
  room: any;
  roomId: string;
}

export const DuelGameContainer = ({ room, roomId }: DuelGameContainerProps) => {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [guessInput, setGuessInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);

  const matchRef = useMemo(() => (db ? doc(db, 'gameRooms', roomId, 'gameMatches', 'currentMatch') : null), [db, roomId]);
  const { data: match } = useDoc(matchRef as any);

  const guessesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'gameRooms', roomId, 'gameMatches', 'currentMatch', 'guesses'), 
      where('playerIds', 'array-contains', user.uid),
      orderBy('timestamp', 'desc')
    );
  }, [db, roomId, user?.uid]);
  const { data: guessesData } = useCollection(guessesQuery);

  const isHost = user?.uid === room.hostId;
  const isPlayer1 = user?.uid === room.playerIds[0];
  const isPlayer2 = user?.uid === room.playerIds[1];
  const isMyTurn = match?.currentTurnPlayerId === user?.uid;
  const opponentId = isPlayer1 ? room.playerIds[1] : room.playerIds[0];

  // Initialize Match
  useEffect(() => {
    if (isHost && room.status === 'ready' && !match && db) {
      const target = Math.floor(Math.random() * 100) + 1;
      setDoc(doc(db, 'gameRooms', roomId, 'gameMatches', 'currentMatch'), {
        id: 'currentMatch',
        roomId,
        player1Id: room.playerIds[0],
        player2Id: room.playerIds[1],
        playerIds: [room.playerIds[0], room.playerIds[1]],
        targetNumber: target,
        status: 'in-progress',
        currentTurnPlayerId: room.playerIds[0],
        turnStartTime: serverTimestamp(),
        startTime: serverTimestamp(),
        player1AttemptsLeft: 10,
        player2AttemptsLeft: 10,
        lastGuessRangeMin: 1,
        lastGuessRangeMax: 100
      });

      updateDoc(doc(db, 'gameRooms', roomId), { status: 'in-game' });
    }
  }, [isHost, room.status, match, db, roomId, room.playerIds]);

  // Turn Timer
  useEffect(() => {
    if (match?.status !== 'in-progress') return;

    const interval = setInterval(() => {
      if (!match.turnStartTime) return;
      const start = match.turnStartTime.toDate?.()?.getTime() || Date.now();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, 15 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && isMyTurn && db) {
        handleGuess(Math.floor(Math.random() * 100) + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match, isMyTurn, db]);

  const handleGuess = async (val: number) => {
    if (!isMyTurn || !db || match?.status !== 'in-progress' || !user) return;

    const hint = getHint(val, match.targetNumber);
    const guessId = Math.random().toString(36).substring(7);
    const guessRef = doc(db, 'gameRooms', roomId, 'gameMatches', 'currentMatch', 'guesses', guessId);

    setDoc(guessRef, {
      playerId: user.uid,
      playerIds: match.playerIds,
      guess: val,
      feedback: hint,
      timestamp: serverTimestamp(),
      turnNumber: (guessesData?.length || 0) + 1
    });

    const isWin = hint === 'Correct';
    const nextTurnId = isWin ? match.currentTurnPlayerId : opponentId;
    
    let newMin = match.lastGuessRangeMin;
    let newMax = match.lastGuessRangeMax;

    if (hint === 'Too High') newMax = Math.min(newMax, val - 1);
    if (hint === 'Too Low') newMin = Math.max(newMin, val + 1);

    updateDoc(matchRef!, {
      currentTurnPlayerId: nextTurnId,
      turnStartTime: serverTimestamp(),
      status: isWin ? 'finished' : 'in-progress',
      winnerId: isWin ? user.uid : null,
      loserId: isWin ? opponentId : null,
      lastGuessRangeMin: newMin,
      lastGuessRangeMax: newMax
    });

    setGuessInput('');
  };

  if (room.status === 'waitingForPlayers') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="bg-primary/20 p-8 rounded-full mb-8">
          <Users className="w-16 h-16 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-2 uppercase italic">Awaiting Challenger</h2>
        <p className="text-muted-foreground mb-8">Share the room code with an opponent to begin synchronization.</p>
        <div className="bg-white/5 border border-white/10 px-10 py-4 rounded-2xl text-4xl font-black tracking-widest text-primary glow-magenta uppercase">
          {roomId}
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center py-10 px-4 md:px-10">
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl transition-all duration-500 relative ${isMyTurn ? 'glass-card border-primary/50 glow-magenta' : 'opacity-40 grayscale'}`}>
            <p className="text-[10px] uppercase font-bold text-primary tracking-tighter">Your Turn</p>
            <h2 className="text-xl font-headline text-white italic">OPERATOR</h2>
          </div>
          <div className="text-2xl font-black text-muted-foreground italic">VS</div>
          <div className={`p-4 rounded-2xl transition-all duration-500 relative ${!isMyTurn ? 'glass-card border-accent/50 glow-cyan' : 'opacity-40 grayscale'}`}>
            <p className="text-[10px] uppercase font-bold text-accent tracking-tighter">Opponent Turn</p>
            <h2 className="text-xl font-headline text-white italic">REVENANT</h2>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Neural Link Time</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white tracking-widest">
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
            <Progress value={(timeLeft / 15) * 100} className="w-24 h-1.5 bg-white/5 mt-2 overflow-hidden rounded-none" />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-accent" />
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Deduction Field</span>
            </div>
            <div className="text-xl font-bold text-white bg-white/5 px-4 py-1 rounded-lg border border-white/10 italic">
              {match.lastGuessRangeMin} <span className="text-accent mx-2">↔</span> {match.lastGuessRangeMax}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6 h-[500px] flex flex-col">
          <HistoryPanel guesses={(guessesData || []).map(g => ({ ...g, hint: g.feedback, timestamp: g.timestamp?.toMillis() || Date.now(), player: g.playerId === user?.uid ? 'YOU' : 'OPP' }))} />
        </div>

        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="mb-10 w-full max-w-sm">
             <div className="glass-card p-10 rounded-3xl border-white/10 flex flex-col items-center gap-6 relative">
                {!isMyTurn && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-3xl">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex flex-col items-center gap-4">
                      <ShieldAlert className="w-12 h-12 text-accent" />
                      <p className="text-xs font-bold text-accent uppercase tracking-widest italic">Opponent is guessing...</p>
                    </motion.div>
                  </div>
                )}
                <Zap className={`w-8 h-8 ${isMyTurn ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="w-full space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">Enter Prediction</p>
                  <Input 
                    type="number"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    disabled={!isMyTurn}
                    className="h-20 bg-white/5 border-white/10 text-center text-4xl font-black text-white rounded-2xl focus:border-primary/50"
                    placeholder="00"
                  />
                </div>
                <Button 
                  onClick={() => handleGuess(parseInt(guessInput))}
                  disabled={!isMyTurn || !guessInput}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl glow-magenta italic"
                >
                  TRANSMIT GUESS
                </Button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-2xl p-6 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                 <div className={`h-2 w-2 rounded-full ${isMyTurn ? 'bg-primary animate-pulse' : 'bg-accent'} `} />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 italic">Arena Metrics</h3>
              <div className="space-y-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Guesses Made</p>
                  <p className="text-xl font-bold text-white">{guessesData?.length || 0}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Target Intensity</p>
                  <p className="text-xl font-bold text-accent">STABLE</p>
                </div>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {match.status === 'finished' && (
          <VictoryScreen 
            winnerName={match.winnerId === user?.uid ? 'YOU' : 'THE OPPONENT'} 
            secretNumber={match.targetNumber} 
            totalAttempts={guessesData?.length || 0}
            onRematch={() => {
              if (isHost) {
                updateDoc(doc(db, 'gameRooms', roomId), { status: 'ready', updatedAt: serverTimestamp() });
                setDoc(matchRef!, {}, { merge: false });
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};