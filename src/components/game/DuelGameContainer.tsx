
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryPanel } from './HistoryPanel';
import { VictoryScreen } from './VictoryScreen';
import { getHint } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Timer, Hash, ShieldAlert, Zap, Loader2, Users, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, updateDoc, collection, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface DuelGameContainerProps {
  room: any;
  roomId: string;
}

export const DuelGameContainer = ({ room, roomId }: DuelGameContainerProps) => {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [guessInput, setGuessInput] = useState('');
  const [setupInput, setSetupInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);

  const matchRef = useMemoFirebase(() => (db ? doc(db, 'gameRooms', roomId, 'gameMatches', 'currentMatch') : null), [db, roomId]);
  const { data: match, isLoading: isMatchLoading } = useDoc(matchRef as any);

  const guessesQuery = useMemoFirebase(() => {
    if (!db || !roomId || !match) return null;
    return query(
      collection(db, 'gameRooms', roomId, 'gameMatches', 'currentMatch', 'guesses'), 
      orderBy('timestamp', 'desc')
    );
  }, [db, roomId, match?.id]);
  
  const { data: guessesData } = useCollection(guessesQuery);

  const isHost = user?.uid === room.hostId;
  const isPlayer1 = user?.uid === room.playerIds[0];
  const opponentId = room.playerIds.find((id: string) => id !== user?.uid);
  const isMyTurn = match?.currentTurnPlayerId === user?.uid && match?.status === 'in-progress';
  
  const iAmReady = isPlayer1 ? match?.p1Ready : match?.p2Ready;
  
  // The number I am trying to guess
  const myTarget = isPlayer1 ? match?.p1Target : match?.p2Target;
  // The number I chose for the opponent
  const myChosenTarget = isPlayer1 ? match?.p2Target : match?.p1Target;

  // Initialize Match Record
  useEffect(() => {
    if (isHost && room.status === 'ready' && !match && !isMatchLoading && db) {
      setDoc(doc(db, 'gameRooms', roomId, 'gameMatches', 'currentMatch'), {
        id: 'currentMatch',
        roomId,
        playerIds: room.playerIds,
        status: 'setup',
        p1Target: null,
        p2Target: null,
        p1Ready: false,
        p2Ready: false,
        currentTurnPlayerId: room.playerIds[0],
        lastGuessRangeMinP1: 1,
        lastGuessRangeMaxP1: 100,
        lastGuessRangeMinP2: 1,
        lastGuessRangeMaxP2: 100,
        createdAt: serverTimestamp()
      });
      updateDoc(doc(db, 'gameRooms', roomId), { status: 'in-game' });
    }
  }, [isHost, room.status, match, isMatchLoading, db, roomId, room.playerIds]);

  // Check if setup is complete
  useEffect(() => {
    if (match?.status === 'setup' && match.p1Ready && match.p2Ready && isHost && db) {
      updateDoc(matchRef!, {
        status: 'in-progress',
        turnStartTime: serverTimestamp(),
        startTime: serverTimestamp()
      });
    }
  }, [match?.p1Ready, match?.p2Ready, match?.status, isHost, db, matchRef]);

  // Turn Timer
  useEffect(() => {
    if (match?.status !== 'in-progress' || !match.turnStartTime) return;

    const interval = setInterval(() => {
      const start = match.turnStartTime?.toMillis?.() || Date.now();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, 15 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && isMyTurn && db) {
        const min = isPlayer1 ? match.lastGuessRangeMinP1 : match.lastGuessRangeMinP2;
        const max = isPlayer1 ? match.lastGuessRangeMaxP1 : match.lastGuessRangeMaxP2;
        handleGuess(Math.floor(Math.random() * (max - min + 1)) + min);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match?.turnStartTime, isMyTurn, db, match, isPlayer1]);

  const handleSetSecret = async () => {
    if (!db || !match || iAmReady) return;
    const val = parseInt(setupInput);
    if (isNaN(val) || val < 1 || val > 100) return;

    // We set the target for the OPPONENT
    const update: any = isPlayer1 ? { p2Target: val, p1Ready: true } : { p1Target: val, p2Ready: true };
    updateDoc(matchRef!, update);
  };

  const handleGuess = async (val: number) => {
    if (!isMyTurn || !db || match?.status !== 'in-progress' || !user || isNaN(val)) return;

    const target = myTarget;
    const hint = getHint(val, target);
    const guessId = `guess_${Date.now()}_${user.uid.substring(0, 4)}`;
    
    setDoc(doc(db, 'gameRooms', roomId, 'gameMatches', 'currentMatch', 'guesses', guessId), {
      playerId: user.uid,
      playerIds: room.playerIds,
      guess: val,
      feedback: hint,
      timestamp: serverTimestamp(),
    });

    const isWin = hint === 'Correct';
    const nextTurnId = isWin ? user.uid : opponentId;
    
    let update: any = {
      currentTurnPlayerId: nextTurnId,
      turnStartTime: serverTimestamp(),
      status: isWin ? 'finished' : 'in-progress',
      winnerId: isWin ? user.uid : null,
      updatedAt: serverTimestamp()
    };

    if (isPlayer1) {
      if (hint === 'Too High') update.lastGuessRangeMaxP1 = Math.min(match.lastGuessRangeMaxP1, val - 1);
      if (hint === 'Too Low') update.lastGuessRangeMinP1 = Math.max(match.lastGuessRangeMinP1, val + 1);
    } else {
      if (hint === 'Too High') update.lastGuessRangeMaxP2 = Math.min(match.lastGuessRangeMaxP2, val - 1);
      if (hint === 'Too Low') update.lastGuessRangeMinP2 = Math.max(match.lastGuessRangeMinP2, val + 1);
    }

    updateDoc(matchRef!, update);
    setGuessInput('');
  };

  const handleAbort = async () => {
    if (!db) return;
    await updateDoc(doc(db, 'gameRooms', roomId), { status: 'aborted', leftBy: user?.uid });
    router.push('/lobby');
  };

  if (room.status === 'aborted') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/20 p-8 rounded-full mb-8">
          <AlertTriangle className="w-16 h-16 text-destructive" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 uppercase italic">Link Severed</h2>
        <p className="text-muted-foreground mb-8">
          The player {room.leftBy === user?.uid ? 'you' : 'opponent'} has terminated the battle link.
        </p>
        <Button onClick={() => router.push('/lobby')} className="bg-primary glow-magenta font-bold">Return to Lobby</Button>
      </div>
    );
  }

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

  if (isMatchLoading || !match) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Match Link...</p>
      </div>
    );
  }

  if (match.status === 'setup') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 max-w-2xl mx-auto w-full">
        <div className="glass-card p-10 rounded-3xl border-primary/20 w-full space-y-8 relative overflow-hidden">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white uppercase italic">Neural Encryption</h2>
            <p className="text-sm text-muted-foreground">Select a number (1-100) for your opponent to guess.</p>
          </div>

          {!iAmReady ? (
            <div className="space-y-6">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <Input 
                  type="number"
                  value={setupInput}
                  onChange={(e) => setSetupInput(e.target.value)}
                  placeholder="00"
                  className="h-20 bg-white/5 border-white/10 text-center text-4xl font-black text-white rounded-2xl focus:border-primary/50"
                />
              </div>
              <Button onClick={handleSetSecret} className="w-full h-16 bg-primary font-black text-xl rounded-2xl glow-magenta">LOCK ENCRYPTION</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="relative">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Unlock className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              </div>
              <p className="text-lg font-bold text-white italic">Encryption Synced. Waiting for opponent...</p>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentRange = isPlayer1 
    ? { min: match.lastGuessRangeMinP1, max: match.lastGuessRangeMaxP1 }
    : { min: match.lastGuessRangeMinP2, max: match.lastGuessRangeMaxP2 };

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
          <div className="flex flex-col items-center min-w-[120px]">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Link Time</span>
            </div>
            <div className={`text-3xl font-bold font-mono tracking-widest ${timeLeft < 5 ? 'text-destructive animate-pulse' : 'text-white'}`}>
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
              {currentRange.min} <span className="text-accent mx-2">↔</span> {currentRange.max}
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
             <div className="glass-card p-10 rounded-3xl border-white/10 flex flex-col items-center gap-6 relative overflow-hidden">
                {!isMyTurn && (
                  <div className="absolute inset-0 bg-background/95 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center rounded-3xl p-6 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <ShieldAlert className="w-12 h-12 text-accent" />
                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-accent/40 rounded-full blur-xl" />
                      </div>
                      <p className="text-sm font-black text-accent uppercase tracking-widest italic">Opponent is guessing...</p>
                      <div className="flex gap-1 mt-4">
                        {[0, 1, 2].map((i) => (
                          <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                        ))}
                      </div>
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
                    autoFocus={isMyTurn}
                    className="h-20 bg-white/5 border-white/10 text-center text-4xl font-black text-white rounded-2xl focus:border-primary/50"
                    placeholder="00"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGuess(parseInt(guessInput));
                    }}
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
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 italic">Arena Metrics</h3>
              <div className="space-y-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Guesses Made</p>
                  <p className="text-xl font-bold text-white">{guessesData?.length || 0}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Your Key for Opponent</p>
                  <p className="text-xl font-bold text-primary italic">{myChosenTarget || '...'}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleAbort} className="w-full mt-6 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-bold uppercase">Abort Match</Button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {match.status === 'finished' && (
          <VictoryScreen 
            winnerName={match.winnerId === user?.uid ? 'YOU' : 'THE OPPONENT'} 
            secretNumber={myTarget} 
            totalAttempts={guessesData?.filter((g:any) => g.playerId === match.winnerId).length || 0}
            onRematch={() => {
              if (isHost) {
                updateDoc(doc(db, 'gameRooms', roomId), { status: 'ready' });
                deleteDoc(matchRef!);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
