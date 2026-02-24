# **App Name**: Guess The Number – Duel Mode

## Core Features:

- Multiplayer Room Management: Players can create or join game rooms via a unique ID. Includes a waiting screen, locking the room for two players, showing opponent info and 'Player Joined' animation, and handling scenarios like auto room expiry for inactive rooms, reconnect support for refreshed players, prevention of duplicate joins, and managing game state if the host leaves (e.g., auto win or room closure).
- Game Configuration Settings: The host player sets game parameters, including custom number ranges (e.g., 1-1000) and difficulty levels with specific turn timer settings (e.g., 15 sec per guess) and total attempts limits. An optional 'Sudden Death' mode can also be configured.
- Turn-Based Guessing Logic: Enables synchronized turn-based gameplay where players submit guesses. The system detects correct guesses to determine the winner, with server-side validation to ensure fair play and prevent cheating.
- Real-time Game State Synchronization: Leverages Firestore real-time listeners for instant updates on player turns, submitted guesses, and game-ending conditions, utilizing server timestamps for accurate synchronization, turn validation rules, and robust cleanup for disconnected players to maintain game integrity and provide reconnect animations.
- Interactive Guess Feedback: Provides animated visual hints ('Too High' - red animated shake + arrow down / 'Too Low' - blue animated bounce + arrow up), a live history panel of guesses, and a dynamic visual number narrowing bar (range shrinking animation).
- User Authentication: Secure user access using Firebase Authentication, supporting both anonymous and Google login options for quick player onboarding.
- Game End & Victory Display: Triggers a celebratory screen with confetti explosions, glowing player avatars, and other victory animations (e.g., full-screen overlay, cinematic animation) for the player who correctly guesses the number first. Includes options for immediate rematch and sharing results.
- Robust Security & Data Integrity: Implements comprehensive Firebase Security Rules to restrict room access, ensure host-only configuration updates, validate guesses server-side, and manage Firestore indexing for optimal performance and secure data handling. This prevents unauthorized modification of game state.
- Player Progression & Social Features: Tracks player progress with a win streak counter, an XP & Level system, and awards various badges (e.g., Fastest Guess, Perfect Game, Mind Reader). Players can view their performance in a detailed match stats dashboard and compete for rankings on a global leaderboard.
- Real-time In-Game Chat: Allows players to communicate with each other in real-time through a dedicated chat interface during the game, enhancing social interaction.
- AI Practice Mode: Offers a single-player mode where users can practice guessing numbers against an AI opponent. The AI will use reasoning tools to provide varied challenge levels.
- Dynamic Gameplay UI Elements: Features interactive UI components such as an animated number input dial (rotating wheel or slider option), a countdown circular timer animation, a real-time progress bar, and an animated score counter to enhance the gameplay experience.
- Audio Controls: Provides options to toggle sound effects for clicks and results, and background music on or off, allowing players to customize their audio experience.
- Customization Options: Allows players to switch between various aesthetic themes (e.g., Neon, Cyberpunk, Minimal, Royal Gold) to personalize their game environment.
- In-Game Communication & Expression: Enables players to send quick emoji reactions during gameplay, fostering dynamic and expressive social interaction.

## Style Guidelines:

- Primary color: A vibrant electric magenta, creating a striking glow effect on interactive elements (#DA3BFF).
- Background color: A very dark, subtle purplish gray, providing a deep canvas for the neon aesthetic (#201721).
- Accent color: A brilliant, saturated cyan that offers strong contrast and emphasizes key information or interactive states (#73E9FF).
- Body and headline font: 'Space Grotesk' (sans-serif) for a modern, computerized, and tech-forward appearance that is suitable for all UI text.
- Use clean, sharp, outlined icons, preferably from Lucide or React Icons, to complement the digital and futuristic theme.
- Dark mode by default with smooth gradient backgrounds and a floating particle background effect. The interface will feature Glassmorphism-inspired 3D cards with soft shadows, ensuring a responsive, mobile-first design with a focus on layered interactive elements.
- Extensive use of Framer Motion for primary UI transitions (e.g., page transitions, smooth modal open/close, animated buttons with hover effects, button press ripple effect), GSAP for special cinematic sequences only (e.g., win screen cinematic, number reveal dramatic zoom effect, advanced timeline animations). Lottie will be used for loading states and victory animations. React Spring will handle subtle micro-interactions and smooth transitions. Canvas Confetti will be used for win effects. All transitions will be smooth (300ms–600ms easing), ensuring 60 FPS performance and including subtle haptic feedback for mobile interactions and micro-interactions on every click.