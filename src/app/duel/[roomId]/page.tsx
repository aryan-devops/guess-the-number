
"use client"
import React from 'react';
import { DuelGameContainer } from '@/components/game/DuelGameContainer';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDoc, useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function DuelPage() {
  const { roomId } = useParams();
  const db = useFirestore();
  const { user } = useUser();
  const roomRef = React.useMemo(() => (db && roomId ? doc(db, 'gameRooms', roomId as string) : null), [db, roomId]);
  const { data: room, isLoading } = useDoc(roomRef as any);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-white mb-4 uppercase italic">Encryption Lost</h1>
        <p className="text-muted-foreground mb-8">The duel chamber could not be established.</p>
        <Link href="/lobby">
          <Button variant="outline" className="border-primary/50 text-primary">Return to Lobby</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col h-full">
        <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 glass-card">
          <Link href="/lobby">
            <Button variant="ghost" className="text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Abort Match
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">Duel Mode</span>
            <div className="h-6 w-px bg-white/10" />
            <span className="text-xs text-muted-foreground font-mono">NODE: {roomId}</span>
          </div>
        </header>

        <DuelGameContainer room={room} roomId={roomId as string} />
      </div>
    </main>
  );
}
