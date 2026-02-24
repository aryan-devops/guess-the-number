
"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Hash, ArrowRight, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

export default function LobbyPage() {
  const [roomCode, setRoomCode] = useState('');

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <ParticleBackground />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        {/* Left: Info & Stats */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black font-headline tracking-tighter text-white mb-6 uppercase">
              BATTLE <span className="text-primary neon-magenta">ARENA</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Create a private room to challenge your friends, or join a global match to test your skills against the world.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 glass-card p-4 rounded-2xl border-white/5">
                <div className="bg-primary/20 p-3 rounded-xl text-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold">1,243 Active Duels</p>
                  <p className="text-xs text-muted-foreground">Currently happening across all regions.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 glass-card p-4 rounded-2xl border-white/5">
                <div className="bg-accent/20 p-3 rounded-xl text-accent">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold">Fair Play Sync</p>
                  <p className="text-xs text-muted-foreground">Server-side validation active for all matches.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Join/Create Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 rounded-3xl border-primary/20 shadow-2xl flex flex-col gap-8"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline text-white">Join Room</h2>
            <p className="text-sm text-muted-foreground">Enter a unique 6-digit room code.</p>
          </div>

          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE" 
              maxLength={6}
              className="pl-12 h-16 bg-white/5 border-white/10 rounded-2xl text-2xl font-bold tracking-[0.5em] text-center uppercase focus:border-primary/50"
            />
          </div>

          <Button 
            disabled={roomCode.length !== 6}
            className="h-16 bg-accent hover:bg-accent/90 text-black rounded-2xl text-xl font-bold glow-cyan"
          >
            JOIN MATCH <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="relative py-2 flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">OR</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          <Link href="/practice" className="w-full">
            <Button variant="outline" className="w-full h-16 border-primary/30 text-primary hover:bg-primary/10 rounded-2xl text-xl font-bold">
              <Plus className="w-5 h-5 mr-2" /> CREATE NEW ROOM
            </Button>
          </Link>
        </motion.div>
      </div>

      <Link href="/" className="fixed top-10 left-10 z-20">
        <Button variant="ghost" className="text-muted-foreground hover:text-white">
          ← BACK
        </Button>
      </Link>
    </main>
  );
}
