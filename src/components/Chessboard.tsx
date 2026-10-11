import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chess, Square } from 'chess.js';
import { BoardOrientation, SquareCoordinate } from '../types/chess';
import { getFileList, getRankList } from '../utils/chessUtils';
import { ChessSquare, SquareStatus } from './ChessSquare';

interface ChessboardProps {
  size: number;
  orientation?: BoardOrientation;
  showLabels?: boolean;
  fen?: string | null;
  selectedSquare?: SquareCoordinate | null;
  legalTargets?: SquareCoordinate[];
  feedback?: { square: SquareCoordinate; status: 'correct' | 'wrong' } | null;
  onSquarePress: (square: SquareCoordinate) => void;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  size,
  orientation = 'white',
  showLabels = true,
  fen = null,
  selectedSquare = null,
  legalTargets = [],
  feedback = null,
  onSquarePress,
}) => {
  const squareSize = Math.floor(size / 8);
  const ranks = useMemo(() => getRankList(orientation), [orientation]);
  const files = useMemo(() => getFileList(orientation), [orientation]);

  const chess = useMemo(() => {
    if (!fen) return null;
    try {
      return new Chess(fen);
    } catch {
      return null;
    }
  }, [fen]);

  const leftEdgeFile = files[0];
  const bottomEdgeRank = ranks[ranks.length - 1];

  return (
    <View style={[styles.boardContainer, { width: squareSize * 8, height: squareSize * 8 }]}>
      {ranks.map((rank) => (
        <View key={rank} style={styles.rankRow}>
          {files.map((file) => {
            const square = `${file}${rank}` as SquareCoordinate;
            let status: SquareStatus = 'default';

            if (feedback && feedback.square === square) {
              status = feedback.status;
            } else if (selectedSquare === square) {
              status = 'selected';
            }

            const isLegalTarget = legalTargets.includes(square);
            const piece = chess ? chess.get(square as Square) : null;

            return (
              <ChessSquare
                key={square}
                square={square}
                size={squareSize}
                piece={piece}
                status={status}
                isLegalMoveTarget={isLegalTarget}
                showRankLabel={showLabels && file === leftEdgeFile}
                showFileLabel={showLabels && rank === bottomEdgeRank}
                onPress={onSquarePress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    backgroundColor: '#000',
  },
  rankRow: {
    flexDirection: 'row',
  },
});
