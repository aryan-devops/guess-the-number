
"use client"
import React from 'react';
import { GameContainer } from '@/components/game/GameContainer';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col h-full">
        <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 glass-card">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-widest text-accent">Practice Mode</span>
            <div className="h-6 w-px bg-white/10" />
            <span className="text-xs text-muted-foreground">vs AI Opponent</span>
          </div>
        </header>

        <GameContainer mode="practice" difficulty="medium" />
      </div>
    </main>
  );
}
