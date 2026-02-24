'use server';
/**
 * @fileOverview This file implements a Genkit flow for an AI opponent in a number guessing game.
 * It defines the input and output schemas for the AI's guess, the prompt that guides the AI's
 * strategy based on difficulty, and the flow that executes the guessing logic.
 *
 * - guessNumberAIFlow - The primary exported function to get the AI's guess.
 * - AiGuessInput - The input type for the guessNumberAIFlow function.
 * - AiGuessOutput - The return type for the guessNumberAIFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiGuessInputSchema = z.object({
  currentMin: z.number().describe('The current minimum possible number in the search range.'),
  currentMax: z.number().describe('The current maximum possible number in the search range.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The AI opponent\'s difficulty level.'),
  totalAttempts: z.number().describe('The total number of attempts made so far by the AI.'),
  maxAttempts: z.number().describe('The maximum allowed attempts for the AI.'),
});
export type AiGuessInput = z.infer<typeof AiGuessInputSchema>;

const AiGuessOutputSchema = z.object({
  guess: z.number().describe('The AI opponent\'s next guess.'),
  reasoning: z.string().optional().describe('The AI opponent\'s reasoning for the guess.'),
});
export type AiGuessOutput = z.infer<typeof AiGuessOutputSchema>;

export async function guessNumberAIFlow(input: AiGuessInput): Promise<AiGuessOutput> {
  return aiOpponentPracticeModeFlow(input);
}

const aiOpponentPrompt = ai.definePrompt({
  name: 'aiOpponentGuessPrompt',
  input: { schema: AiGuessInputSchema },
  output: { schema: AiGuessOutputSchema },
  prompt: `You are an AI opponent playing a "Guess The Number" game.\nThe secret number is between {{{currentMin}}} and {{{currentMax}}} (inclusive).\nYou have made {{{totalAttempts}}} guesses out of a maximum of {{{maxAttempts}}} allowed attempts.\n\nYour goal is to guess the number as efficiently as possible based on the difficulty level.\n\nDifficulty: {{{difficulty}}}\n\nHere's how you should make your guess:\n- If the difficulty is 'easy', make a somewhat random guess within the current range [{{{currentMin}}}, {{{currentMax}}}]. It doesn't have to be perfectly random, but should not always be the middle. Try to be less strategic.\n- If the difficulty is 'medium', perform a binary search strategy. Guess the midpoint of the current range [{{{currentMin}}}, {{{currentMax}}}].\n- If the difficulty is 'hard', perform a binary search strategy. Guess the midpoint of the current range [{{{currentMin}}}, {{{currentMax}}}]. Also, provide sophisticated reasoning that considers the remaining attempts and the current range.\n\nYou MUST provide your next guess as a single integer within the range [{{{currentMin}}}, {{{currentMax}}}].\nYou MUST also provide a brief reasoning for your guess.\n\nOutput your response as a JSON object with 'guess' (integer) and 'reasoning' (string) fields.\n`,
});

const aiOpponentPracticeModeFlow = ai.defineFlow(
  {
    name: 'aiOpponentPracticeModeFlow',
    inputSchema: AiGuessInputSchema,
    outputSchema: AiGuessOutputSchema,
  },
  async (input) => {
    const { output } = await aiOpponentPrompt(input);
    if (!output) {
      throw new Error('AI failed to provide a guess.');
    }

    // Validate and potentially adjust the AI's guess to ensure it's within the allowed range.
    let validatedGuess = output.guess;
    if (typeof validatedGuess !== 'number' || isNaN(validatedGuess)) {
      // Fallback if the LLM returns a non-number or NaN.
      validatedGuess = Math.floor((input.currentMin + input.currentMax) / 2);
    }
    validatedGuess = Math.max(input.currentMin, Math.min(input.currentMax, validatedGuess));
    validatedGuess = Math.round(validatedGuess); // Ensure it's an integer

    return {
      guess: validatedGuess,
      reasoning: output.reasoning || `Guessed ${validatedGuess} based on difficulty ${input.difficulty}.`,
    };
  }
);
