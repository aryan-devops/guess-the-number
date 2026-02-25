# Neon Duel: Guess The Number

A high-stakes, neon-infused multiplayer number guessing game built with Next.js and Firebase. Challenge real opponents in synchronized turn-based duels or practice against an advanced AI.

## Features

- **Multiplayer Duel Arena**: Real-time 1v1 battles with synchronized turns and 15-second timers.
- **Neural Encryption**: Set secret numbers for your opponent to guess in a two-phase setup.
- **AI Practice Mode**: Train against "CyberBot-v1" with dynamic difficulty levels.
- **Global Leaderboard**: Compete for rankings and track your XP/Level progression.
- **Modern UI**: Futuristic cyberpunk aesthetic with Framer Motion animations and ShadCN components.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore (Real-time sync)
- **Auth**: Firebase Anonymous Authentication
- **Styling**: Tailwind CSS & Lucide Icons
- **Components**: ShadCN UI & Framer Motion

## How to Push to GitHub

Since this environment provides the code but doesn't execute Git commands, follow these steps in your local terminal to upload the project to your repository:

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   ```

2. **Add all files**:
   ```bash
   git add .
   ```

3. **Commit the changes**:
   ```bash
   git commit -m "Initial commit: Neon Duel Guess The Number"
   ```

4. **Link to your GitHub Repository**:
   ```bash
   git remote add origin https://github.com/aryan-devops/guess-the-number
   ```

5. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Local Development

To run the project locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:9002](http://localhost:9002) in your browser.
