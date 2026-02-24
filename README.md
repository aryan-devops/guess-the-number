# Guess The Number – Duel Mode

A neon-infused, futuristic multiplayer number guessing game built with Next.js, Firebase, and Tailwind CSS.

## Features

- **Duel Mode**: Real-time 1v1 multiplayer duels using Firebase Firestore.
- **Neural Encryption**: Players set secret numbers for their opponents to crack.
- **Link Monitoring**: Real-time detection if an opponent aborts the match.
- **AI Practice**: Train against a CyberBot using binary search logic.
- **Global Leaderboard**: Compete for the top spot in the Hall of Fame.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd guess-the-number-duel
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Create a project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication (Anonymous).
   - Enable Firestore Database.
   - Update `src/firebase/config.ts` with your project credentials.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:9002](http://localhost:9002).

## How to Push to GitHub

To upload this code to your own GitHub repository, run these commands in your terminal:

1. **Initialize Git**:
   ```bash
   git init
   ```

2. **Add all files**:
   ```bash
   git add .
   ```

3. **Commit the changes**:
   ```bash
   git commit -m "Initial commit: Guess The Number Duel Mode"
   ```

4. **Create a new repository on GitHub** (e.g., named `guess-the-number-duel`).

5. **Set the remote and branch**:
   ```bash
   git branch -M main
   git remote add origin <your-github-repo-url>
   ```

6. **Push the code**:
   ```bash
   git push -u origin main
   ```
