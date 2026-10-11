export type BoardOrientation = 'white' | 'black';

export type DrillMode = 'empty_board' | 'piece_moves';

export type DrillDuration = 30 | 60 | 0; // 0 represents untimed practice

export type FileSymbol = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type RankSymbol = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type SquareCoordinate = `${FileSymbol}${RankSymbol}`;

export interface ScoreRecord {
  id: number;
  mode: DrillMode;
  duration: number;
  score: number;
  accuracy: number;
  total_attempts: number;
  correct_attempts: number;
  created_at: string;
}

export interface PersonalBest {
  mode: DrillMode;
  duration: number;
  best_score: number;
  best_accuracy: number;
  last_played: string;
}

export interface DrillSettings {
  mode: DrillMode;
  duration: DrillDuration;
  orientation: 'white' | 'black' | 'random';
  showLabels: boolean;
}
