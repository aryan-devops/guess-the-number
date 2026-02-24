
"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Hash, ArrowRight, Shield, Globe, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LobbyPage() {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!user || !db) return;
    setIsCreating(true);
    const code = generateRoomCode();
    const roomRef = doc(db, 'gameRooms', code);

    try {
      await setDoc(roomRef, {
        id: code,
        hostId: user.uid,
        playerIds: [user.uid],
        status: 'waitingForPlayers',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        minNumber: 1,
        maxNumber: 100,
        turnTimerSeconds: 15,
        maxAttemptsPerPlayer: 10,
        suddenDeathMode: false
      });
      router.push(`/duel/${code}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Could not initialize the battle arena."
      });
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !db || roomCode.length !== 6) return;
    setIsJoining(true);
    const roomRef = doc(db, 'gameRooms', roomCode);

    try {
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        toast({
          variant: "destructive",
          title: "Room Not Found",
          description: "This battle sequence does not exist."
        });
        setIsJoining(false);
        return;
      }

      const data = roomSnap.data();
      if (data.status !== 'waitingForPlayers') {
        toast({
          variant: "destructive",
          title: "Room Busy",
          description: "This match is already in progress or closed."
        });
        setIsJoining(false);
        return;
      }

      if (!data.playerIds.includes(user.uid)) {
        await setDoc(roomRef, {
          ...data,
          playerIds: [...data.playerIds, user.uid],
          status: 'ready',
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      router.push(`/duel/${roomCode}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Join Error",
        description: "Could not link to the neural arena."
      });
      setIsJoining(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <ParticleBackground />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        <div className="flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black font-headline tracking-tighter text-white mb-6 uppercase italic">
              BATTLE <span className="text-primary neon-magenta">ARENA</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Enter the synchronized deduction matrix. Duel real opponents in high-stakes numeric warfare.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 glass-card p-4 rounded-2xl border-white/5">
                <div className="bg-primary/20 p-3 rounded-xl text-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold">Encrypted Nodes</p>
                  <p className="text-xs text-muted-foreground">Real-time Firebase sync active.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 glass-card p-4 rounded-2xl border-white/5">
                <div className="bg-accent/20 p-3 rounded-xl text-accent">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold">Fair Play Protocol</p>
                  <p className="text-xs text-muted-foreground">15s turn enforcement synchronized.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 rounded-3xl border-primary/20 shadow-2xl flex flex-col gap-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline text-white">Join Room</h2>
            <p className="text-sm text-muted-foreground">Enter the 6-character encryption key.</p>
          </div>

          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE" 
              maxLength={6}
              className="pl-12 h-16 bg-white/5 border-white/10 rounded-2xl text-2xl font-bold tracking-[0.2em] text-center uppercase focus:border-primary/50"
            />
          </div>

          <Button 
            onClick={handleJoinRoom}
            disabled={roomCode.length !== 6 || isJoining || isCreating}
            className="h-16 bg-accent hover:bg-accent/90 text-black rounded-2xl text-xl font-bold glow-cyan"
          >
            {isJoining ? <Loader2 className="animate-spin w-6 h-6" /> : <>JOIN MATCH <ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>

          <div className="relative py-2 flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">OR</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleCreateRoom}
            disabled={isJoining || isCreating}
            className="w-full h-16 border-primary/30 text-primary hover:bg-primary/10 rounded-2xl text-xl font-bold"
          >
            {isCreating ? <Loader2 className="animate-spin w-6 h-6" /> : <><Plus className="w-5 h-5 mr-2" /> CREATE NEW ROOM</>}
          </Button>
        </motion.div>
      </div>

      <Link href="/" className="fixed top-10 left-10 z-20">
        <Button variant="ghost" className="text-muted-foreground hover:text-white">← BACK</Button>
      </Link>
    </main>
  );
}
