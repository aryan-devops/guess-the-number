
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Button } from '@/components/ui/button';
import { Trophy, Bot, Users, Settings, Play, Github } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-5xl px-6 py-20 flex flex-col items-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Season 1: Neon Duel</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-white mb-4 uppercase italic">
            GUESS THE <span className="text-primary neon-magenta">NUMBER</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Master the art of deduction in a high-stakes, cyberpunk multiplayer duel.
            Outsmart your opponents or practice against AI.
          </p>
        </motion.div>

        {/* Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          <GameModeCard 
            title="DUEL MODE" 
            desc="Battle real players in 1v1 synchronized turns." 
            icon={<Users className="w-8 h-8" />} 
            accent="magenta"
            href="/lobby"
          />
          <GameModeCard 
            title="AI PRACTICE" 
            desc="Train against our advanced GenAI opponent." 
            icon={<Bot className="w-8 h-8" />} 
            accent="cyan"
            href="/practice"
          />
          <GameModeCard 
            title="LEADERBOARD" 
            desc="Compete for global rankings and earn badges." 
            icon={<Trophy className="w-8 h-8" />} 
            accent="white"
            href="/leaderboard"
          />
        </div>

        {/* Action Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <Link href="/practice">
            <Button className="h-16 px-10 bg-primary hover:bg-primary/90 rounded-2xl text-xl font-bold glow-magenta group">
              <Play className="w-6 h-6 mr-2 group-hover:scale-125 transition-transform" /> START QUICK GAME
            </Button>
          </Link>
          <Button variant="outline" className="h-16 px-10 border-white/10 glass-card rounded-2xl text-xl font-bold hover:bg-white/5">
            <Settings className="w-6 h-6 mr-2" /> SETTINGS
          </Button>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 flex items-center gap-8 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-sm font-medium">© 2024 NEON DUEL STUDIOS</p>
          <div className="h-4 w-px bg-muted-foreground" />
          <div className="flex gap-4">
            <Github className="w-5 h-5 cursor-pointer" />
          </div>
        </div>
      </div>
    </main>
  );
}

function GameModeCard({ title, desc, icon, accent, href }: { title: string, desc: string, icon: React.ReactNode, accent: string, href: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        className={`glass-card p-8 rounded-3xl border-white/10 hover:border-${accent === 'magenta' ? 'primary' : accent === 'cyan' ? 'accent' : 'white'}/30 transition-all group h-full flex flex-col`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
          accent === 'magenta' ? 'bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white' :
          accent === 'cyan' ? 'bg-accent/20 text-accent group-hover:bg-accent group-hover:text-black' :
          'bg-white/10 text-white group-hover:bg-white group-hover:text-black'
        }`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold font-headline mb-2 text-white">{title}</h3>
        <p className="text-muted-foreground text-sm flex-1">{desc}</p>
        <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Select Mode <span className="text-lg">→</span>
        </div>
      </motion.div>
    </Link>
  );
}
