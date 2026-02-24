
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Zap, Star, Flame, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const leaderboardData = [
  { rank: 1, name: 'CyberGuess_99', level: 42, wins: 154, streak: 12, xp: 45000 },
  { rank: 2, name: 'NeonKnight', level: 38, wins: 128, streak: 5, xp: 38200 },
  { rank: 3, name: 'BitMaster', level: 35, wins: 112, streak: 8, xp: 32100 },
  { rank: 4, name: 'LogicGhost', level: 31, wins: 98, streak: 2, xp: 28400 },
  { rank: 5, name: 'DataDrift', level: 28, wins: 85, streak: 4, xp: 22000 },
  { rank: 6, name: 'SyncVoid', level: 25, wins: 72, streak: 1, xp: 19500 },
  { rank: 7, name: 'GigaBrain', level: 22, wins: 64, streak: 0, xp: 16200 },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen relative py-20 px-6 overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Main Menu
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-5xl font-black font-headline tracking-tighter text-white mb-2 uppercase">
              HALL OF <span className="text-accent neon-cyan">FAME</span>
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Global Rankings • Season 1</p>
          </div>
          <div className="w-32 hidden md:block" />
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-4 mb-12 items-end">
          <PodiumPlace rank={2} name={leaderboardData[1].name} xp={leaderboardData[1].xp} color="cyan" />
          <PodiumPlace rank={1} name={leaderboardData[0].name} xp={leaderboardData[0].xp} color="magenta" height="h-64" />
          <PodiumPlace rank={3} name={leaderboardData[2].name} xp={leaderboardData[2].xp} color="white" />
        </div>

        {/* Table */}
        <div className="glass-card rounded-3xl overflow-hidden border-white/5">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-center">Wins</div>
            <div className="col-span-2 text-center">Streak</div>
          </div>
          {leaderboardData.slice(3).map((player, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={player.name}
              className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 items-center hover:bg-white/5 transition-colors"
            >
              <div className="col-span-1 text-center font-bold text-white">#{player.rank}</div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Award className="w-4 h-4 text-accent" />
                </div>
                <span className="font-bold text-white">{player.name}</span>
              </div>
              <div className="col-span-2 text-center">
                 <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold border border-primary/30">Lv {player.level}</span>
              </div>
              <div className="col-span-2 text-center font-bold text-white">{player.wins}</div>
              <div className="col-span-2 text-center">
                 {player.streak > 0 && (
                   <span className="text-orange-500 font-bold flex items-center justify-center gap-1">
                     {player.streak} <Flame className="w-3 h-3 fill-orange-500" />
                   </span>
                 )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

function PodiumPlace({ rank, name, xp, color, height = 'h-48' }: { rank: number, name: string, xp: number, color: string, height?: string }) {
  const isMagenta = color === 'magenta';
  const isCyan = color === 'cyan';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center glass-card border-2 ${
          isMagenta ? 'border-primary glow-magenta' : isCyan ? 'border-accent glow-cyan' : 'border-white/20'
        }`}>
          {rank === 1 ? <Trophy className="w-10 h-10 text-primary" /> : <Star className={`w-8 h-8 ${isCyan ? 'text-accent' : 'text-white/50'}`} />}
        </div>
        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border flex items-center justify-center font-bold ${
          isMagenta ? 'border-primary text-primary' : isCyan ? 'border-accent text-accent' : 'border-white/20'
        }`}>
          {rank}
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-white truncate w-24">{name}</p>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{xp.toLocaleString()} XP</p>
      </div>
      <div className={`w-full ${height} glass-card rounded-t-2xl border-b-0 flex items-center justify-center ${
        isMagenta ? 'border-primary/30' : isCyan ? 'border-accent/30' : 'border-white/10'
      }`}>
        <Zap className={`w-6 h-6 opacity-20 ${isMagenta ? 'text-primary' : isCyan ? 'text-accent' : 'text-white'}`} />
      </div>
    </motion.div>
  );
}
