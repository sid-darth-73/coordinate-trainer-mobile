import { Chess, Square } from 'chess.js';
import { BoardOrientation, FileSymbol, RankSymbol, SquareCoordinate } from '../types/chess';

export const FILES: FileSymbol[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS: RankSymbol[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const ALL_SQUARES: SquareCoordinate[] = FILES.flatMap((file) =>
  RANKS.map((rank) => `${file}${rank}` as SquareCoordinate)
);

export function isLightSquare(square: SquareCoordinate): boolean {
  const fileIndex = FILES.indexOf(square[0] as FileSymbol);
  const rankIndex = RANKS.indexOf(square[1] as RankSymbol);
  return (fileIndex + rankIndex) % 2 === 1;
}

export function getRandomSquare(exclude?: SquareCoordinate): SquareCoordinate {
  let pick: SquareCoordinate;
  do {
    const randomIndex = Math.floor(Math.random() * ALL_SQUARES.length);
    pick = ALL_SQUARES[randomIndex];
  } while (exclude && pick === exclude);
  return pick;
}

export function getRankList(orientation: BoardOrientation): RankSymbol[] {
  return orientation === 'white'
    ? ['8', '7', '6', '5', '4', '3', '2', '1']
    : ['1', '2', '3', '4', '5', '6', '7', '8'];
}

export function getFileList(orientation: BoardOrientation): FileSymbol[] {
  return orientation === 'white'
    ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
}

export interface CuratedPosition {
  name: string;
  fen: string;
  turn: 'w' | 'b';
}

export const CURATED_POSITIONS: CuratedPosition[] = [
  {
    name: 'Starting Position',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'w',
  },
  {
    name: 'Italian Game',
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    turn: 'w',
  },
  {
    name: 'Sicilian Defense',
    fen: 'r1bqkbnr/pp1ppppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4',
    turn: 'b',
  },
  {
    name: 'Ruy Lopez',
    fen: 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    turn: 'w',
  },
  {
    name: 'Queen\'s Gambit Declined',
    fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    turn: 'w',
  },
  {
    name: 'French Defense',
    fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    turn: 'w',
  },
  {
    name: 'King\'s Indian Defense',
    fen: 'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 1 6',
    turn: 'b',
  },
  {
    name: 'Caro-Kann Defense',
    fen: 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    turn: 'w',
  },
];

export interface MoveChallenge {
  fen: string;
  targetSan: string;
  targetMove: {
    from: Square;
    to: Square;
    san: string;
    piece: string;
  };
  orientation: BoardOrientation;
  positionName: string;
}

export function generateRandomMoveChallenge(): MoveChallenge {
  const pos = CURATED_POSITIONS[Math.floor(Math.random() * CURATED_POSITIONS.length)];
  const chess = new Chess(pos.fen);
  const legalMoves = chess.moves({ verbose: true });

  const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];

  return {
    fen: pos.fen,
    targetSan: randomMove.san,
    targetMove: {
      from: randomMove.from,
      to: randomMove.to,
      san: randomMove.san,
      piece: randomMove.piece,
    },
    orientation: pos.turn === 'w' ? 'white' : 'black',
    positionName: pos.name,
  };
}
