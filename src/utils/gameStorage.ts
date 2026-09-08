/**
 * Game Storage & Record Persistence Engine
 * Saves high scores, best lap times, and allows user to reset records.
 */

export interface GameRecord {
  score: number;
  bestTime?: number; // in seconds
  bestLap?: number; // in seconds
  wins?: number;
  date?: string;
}

const STORAGE_PREFIX = 'mateus_game_';

export const getGameHighScore = (gameId: string, fallback: number = 0): number => {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(`${STORAGE_PREFIX}${gameId}_score`);
    if (val !== null) {
      const num = parseInt(val, 10);
      return isNaN(num) ? fallback : num;
    }
  } catch (e) {
    console.warn('getGameHighScore error', e);
  }
  return fallback;
};

export const saveGameHighScore = (gameId: string, score: number): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const current = getGameHighScore(gameId, 0);
    if (score > current) {
      localStorage.setItem(`${STORAGE_PREFIX}${gameId}_score`, String(score));
      window.dispatchEvent(new CustomEvent('game-high-score-updated', { detail: { gameId, score } }));
      return true;
    }
  } catch (e) {
    console.warn('saveGameHighScore error', e);
  }
  return false;
};

export const getGameBestTime = (gameId: string, fallback?: number): number | undefined => {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(`${STORAGE_PREFIX}${gameId}_time`);
    if (val !== null) {
      const num = parseFloat(val);
      return isNaN(num) ? fallback : num;
    }
  } catch (e) {
    console.warn('getGameBestTime error', e);
  }
  return fallback;
};

export const saveGameBestTime = (gameId: string, timeSeconds: number): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const current = getGameBestTime(gameId, 99999);
    if (timeSeconds < (current ?? 99999)) {
      localStorage.setItem(`${STORAGE_PREFIX}${gameId}_time`, timeSeconds.toFixed(2));
      window.dispatchEvent(new CustomEvent('game-high-score-updated', { detail: { gameId, timeSeconds } }));
      return true;
    }
  } catch (e) {
    console.warn('saveGameBestTime error', e);
  }
  return false;
};

export const resetAllGameRecords = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('game-records-reset'));
  } catch (e) {
    console.warn('resetAllGameRecords error', e);
  }
};

/**
 * Notify M-BOT and other UI modules that a game session is active or finished
 */
export const setGameActiveStatus = (isActive: boolean, gameTitle?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent('mbot-game-active', {
        detail: { isActive, gameTitle },
      })
    );
  } catch (e) {}
};
