
export const generateSecretNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getHint = (guess: number, secret: number): 'Too High' | 'Too Low' | 'Correct' => {
  if (guess > secret) return 'Too High';
  if (guess < secret) return 'Too Low';
  return 'Correct';
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateXP = (attempts: number, timeSpent: number, won: boolean): number => {
  if (!won) return 50;
  const baseXP = 200;
  const attemptBonus = Math.max(0, (15 - attempts) * 20);
  const timeBonus = Math.max(0, (60 - timeSpent) * 5);
  return baseXP + attemptBonus + timeBonus;
};

export const getRank = (xp: number): string => {
  if (xp < 1000) return 'Novice';
  if (xp < 5000) return 'Adept';
  if (xp < 15000) return 'Master';
  return 'Grandmaster';
};
