import { getDatabase } from './index';
import { DrillMode, PersonalBest, ScoreRecord } from '../types/chess';

export function saveScoreResult(
  mode: DrillMode,
  duration: number,
  score: number,
  accuracy: number,
  totalAttempts: number,
  correctAttempts: number
): number {
  const db = getDatabase();
  const now = new Date().toISOString();

  const result = db.runSync(
    `INSERT INTO scores (mode, duration, score, accuracy, total_attempts, correct_attempts, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [mode, duration, score, accuracy, totalAttempts, correctAttempts, now]
  );

  return result.lastInsertRowId;
}

export function fetchPersonalBests(): PersonalBest[] {
  const db = getDatabase();
  const rows = db.getAllSync<{
    mode: DrillMode;
    duration: number;
    best_score: number;
    best_accuracy: number;
    last_played: string;
  }>(`
    SELECT 
      mode, 
      duration, 
      MAX(score) as best_score, 
      MAX(accuracy) as best_accuracy,
      MAX(created_at) as last_played
    FROM scores
    WHERE duration > 0
    GROUP BY mode, duration
    ORDER BY mode ASC, duration ASC
  `);

  return rows;
}

export function fetchPersonalBest(mode: DrillMode, duration: number): PersonalBest | null {
  const db = getDatabase();
  const row = db.getFirstSync<{
    mode: DrillMode;
    duration: number;
    best_score: number;
    best_accuracy: number;
    last_played: string;
  }>(
    `
    SELECT 
      mode, 
      duration, 
      MAX(score) as best_score, 
      MAX(accuracy) as best_accuracy,
      MAX(created_at) as last_played
    FROM scores
    WHERE mode = ? AND duration = ?
    GROUP BY mode, duration
  `,
    [mode, duration]
  );

  return row ?? null;
}

export function fetchRecentScores(limit: number = 30): ScoreRecord[] {
  const db = getDatabase();
  const rows = db.getAllSync<ScoreRecord>(
    `
    SELECT id, mode, duration, score, accuracy, total_attempts, correct_attempts, created_at
    FROM scores
    ORDER BY id DESC
    LIMIT ?
  `,
    [limit]
  );

  return rows;
}

export function clearAllScores(): void {
  const db = getDatabase();
  db.execSync(`DELETE FROM scores;`);
}
