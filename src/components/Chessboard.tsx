import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chess, Square } from 'chess.js';
import { BoardOrientation, SquareCoordinate } from '../types/chess';
import { getFileList, getRankList } from '../utils/chessUtils';
import { ChessSquare, SquareStatus } from './ChessSquare';
import { DraggablePiece } from './DraggablePiece';

interface ChessboardProps {
  size: number;
  orientation?: BoardOrientation;
  showLabels?: boolean;
  fen?: string | null;
  selectedSquare?: SquareCoordinate | null;
  legalTargets?: SquareCoordinate[];
  feedback?: { square: SquareCoordinate; status: 'correct' | 'wrong' } | null;
  onSquarePress: (square: SquareCoordinate) => void;
  onPieceDragStart?: (square: SquareCoordinate) => void;
  onPieceDrop?: (from: SquareCoordinate, to: SquareCoordinate) => void;
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
  onPieceDragStart,
  onPieceDrop,
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

  const piecesList = useMemo(() => {
    if (!chess) return [];
    const list: {
      square: SquareCoordinate;
      type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
      color: 'w' | 'b';
      colIndex: number;
      rowIndex: number;
    }[] = [];

    ranks.forEach((rank, rIdx) => {
      files.forEach((file, cIdx) => {
        const sq = `${file}${rank}` as SquareCoordinate;
        const p = chess.get(sq as Square);
        if (p) {
          list.push({
            square: sq,
            type: p.type,
            color: p.color,
            colIndex: cIdx,
            rowIndex: rIdx,
          });
        }
      });
    });

    return list;
  }, [chess, files, ranks]);

  return (
    <View style={[styles.boardContainer, { width: squareSize * 8, height: squareSize * 8 }]}>
      {/* 64 Board Squares (Layer 1) */}
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
            const hasPiece = Boolean(chess && chess.get(square as Square));

            return (
              <ChessSquare
                key={square}
                square={square}
                size={squareSize}
                status={status}
                hasPiece={hasPiece}
                isLegalMoveTarget={isLegalTarget}
                showRankLabel={showLabels && file === leftEdgeFile}
                showFileLabel={showLabels && rank === bottomEdgeRank}
                onPress={onSquarePress}
              />
            );
          })}
        </View>
      ))}

      {/* Floating Interactive Pieces (Layer 2) */}
      {chess && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {piecesList.map((item) => (
            <DraggablePiece
              key={`${item.square}-${item.type}-${item.color}`}
              type={item.type}
              color={item.color}
              square={item.square}
              squareSize={squareSize}
              colIndex={item.colIndex}
              rowIndex={item.rowIndex}
              files={files}
              ranks={ranks}
              isDraggable={item.color === chess.turn()}
              isLegalTarget={legalTargets.includes(item.square)}
              onTap={onSquarePress}
              onDragStart={(sq) => {
                if (onPieceDragStart) {
                  onPieceDragStart(sq);
                } else {
                  onSquarePress(sq);
                }
              }}
              onDrop={(from, to) => {
                if (onPieceDrop) {
                  onPieceDrop(from, to);
                } else {
                  onSquarePress(to);
                }
              }}
            />
          ))}
        </View>
      )}
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
    position: 'relative',
  },
  rankRow: {
    flexDirection: 'row',
  },
});
