import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { SquareCoordinate } from '../types/chess';
import { isLightSquare } from '../utils/chessUtils';
import { ChessPiece } from './ChessPiece';

export type SquareStatus = 'default' | 'correct' | 'wrong' | 'selected' | 'target_hint';

interface ChessSquareProps {
  square: SquareCoordinate;
  size: number;
  piece?: {
    type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
    color: 'w' | 'b';
  } | null;
  hasPiece?: boolean;
  status?: SquareStatus;
  isLegalMoveTarget?: boolean;
  showFileLabel?: boolean;
  showRankLabel?: boolean;
  onPress: (square: SquareCoordinate) => void;
}

export const ChessSquare = React.memo<ChessSquareProps>(
  ({
    square,
    size,
    piece,
    hasPiece = false,
    status = 'default',
    isLegalMoveTarget = false,
    showFileLabel = false,
    showRankLabel = false,
    onPress,
  }) => {
    const hasOccupant = Boolean(piece || hasPiece);
    const isLight = isLightSquare(square);
    const baseColor = isLight ? Colors.boardLight : Colors.boardDark;
    const labelColor = isLight ? Colors.boardDark : Colors.boardLight;

    let backgroundColor = baseColor;
    if (status === 'correct') {
      backgroundColor = Colors.boardCorrect;
    } else if (status === 'wrong') {
      backgroundColor = Colors.boardWrong;
    } else if (status === 'selected') {
      backgroundColor = Colors.boardHighlight;
    }

    const fileLetter = square[0];
    const rankNumber = square[1];

    return (
      <Pressable
        style={[
          styles.square,
          {
            width: size,
            height: size,
            backgroundColor,
          },
        ]}
        onPress={() => onPress(square)}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.15)', borderless: false }}
      >
        {/* Top-left Rank Label (e.g. "1" - "8") */}
        {showRankLabel && (
          <Text
            style={[
              styles.rankLabel,
              {
                color: labelColor,
                fontSize: Math.max(10, Math.floor(size * 0.2)),
              },
            ]}
          >
            {rankNumber}
          </Text>
        )}

        {/* Bottom-right File Label (e.g. "a" - "h") */}
        {showFileLabel && (
          <Text
            style={[
              styles.fileLabel,
              {
                color: labelColor,
                fontSize: Math.max(10, Math.floor(size * 0.2)),
              },
            ]}
          >
            {fileLetter}
          </Text>
        )}

        {/* Legal Move Destination Hint Dot */}
        {isLegalMoveTarget && !hasOccupant && (
          <View
            style={[
              styles.moveDot,
              {
                width: size * 0.32,
                height: size * 0.32,
                borderRadius: (size * 0.32) / 2,
              },
            ]}
          />
        )}

        {/* Legal Capture Ring Indicator */}
        {isLegalMoveTarget && hasOccupant && (
          <View
            style={[
              styles.captureRing,
              {
                width: size * 0.88,
                height: size * 0.88,
                borderRadius: (size * 0.88) / 2,
              },
            ]}
          />
        )}

        {/* Chess Piece */}
        {piece && <ChessPiece type={piece.type} color={piece.color} size={size} />}
      </Pressable>
    );
  }
);

ChessSquare.displayName = 'ChessSquare';

const styles = StyleSheet.create({
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  rankLabel: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontWeight: '700',
    opacity: 0.85,
    pointerEvents: 'none',
  },
  fileLabel: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontWeight: '700',
    opacity: 0.85,
    pointerEvents: 'none',
  },
  moveDot: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 2,
  },
  captureRing: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(216, 64, 64, 0.85)',
    zIndex: 2,
  },
});
