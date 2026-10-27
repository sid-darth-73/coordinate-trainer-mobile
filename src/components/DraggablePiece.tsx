import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { FileSymbol, RankSymbol, SquareCoordinate } from '../types/chess';
import { ChessPiece } from './ChessPiece';

interface DraggablePieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  square: SquareCoordinate;
  squareSize: number;
  colIndex: number;
  rowIndex: number;
  files: FileSymbol[];
  ranks: RankSymbol[];
  isDraggable: boolean;
  isLegalTarget?: boolean;
  onTap: (square: SquareCoordinate) => void;
  onDragStart?: (square: SquareCoordinate) => void;
  onDrop: (from: SquareCoordinate, to: SquareCoordinate) => void;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = React.memo(
  ({
    type,
    color,
    square,
    squareSize,
    colIndex,
    rowIndex,
    files,
    ranks,
    isDraggable,
    isLegalTarget = false,
    onTap,
    onDragStart,
    onDrop,
  }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const scale = useSharedValue(1);

    const handleTap = () => {
      onTap(square);
    };

    const handleDrop = (targetSquare: SquareCoordinate) => {
      onDrop(square, targetSquare);
    };

    const handleDragStart = () => {
      if (onDragStart) {
        onDragStart(square);
      }
    };

    // Dedicated tap gesture: triggers on click/tap release
    const tapGesture = Gesture.Tap()
      .maxDuration(300)
      .onEnd(() => {
        'worklet';
        runOnJS(handleTap)();
      });

    // Pan gesture: triggers on drag movement >= 3px
    const panGesture = Gesture.Pan()
      .enabled(isDraggable)
      .minDistance(3)
      .onStart(() => {
        'worklet';
        isDragging.value = true;
        scale.value = 1.12;
        runOnJS(handleDragStart)();
      })
      .onUpdate((event) => {
        'worklet';
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd((event) => {
        'worklet';
        const originCenterX = colIndex * squareSize + squareSize / 2;
        const originCenterY = rowIndex * squareSize + squareSize / 2;
        const dropX = originCenterX + event.translationX;
        const dropY = originCenterY + event.translationY;

        const targetCol = Math.floor(dropX / squareSize);
        const targetRow = Math.floor(dropY / squareSize);

        if (targetCol >= 0 && targetCol < 8 && targetRow >= 0 && targetRow < 8) {
          const targetSquare = `${files[targetCol]}${ranks[targetRow]}` as SquareCoordinate;
          runOnJS(handleDrop)(targetSquare);
        }
      })
      .onFinalize(() => {
        'worklet';
        // Ultra-snappy spring snap-back (stiffness 500, damping 30)
        translateX.value = withSpring(0, { damping: 30, stiffness: 500 });
        translateY.value = withSpring(0, { damping: 30, stiffness: 500 });
        scale.value = 1;
        isDragging.value = false;
      });

    // Race ensures tap and pan coexist perfectly:
    // If finger moves >= 3px, pan activates first and cancels tap.
    // If finger lifts before 3px, tap wins and completes onEnd immediately.
    const activeGesture = isDraggable
      ? Gesture.Race(panGesture, tapGesture)
      : tapGesture;

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
        ],
        zIndex: isDragging.value ? 9999 : 1,
        elevation: isDragging.value ? 24 : 1,
      };
    });

    const left = colIndex * squareSize;
    const top = rowIndex * squareSize;

    return (
      <GestureDetector gesture={activeGesture}>
        <Animated.View
          style={[
            styles.pieceContainer,
            {
              width: squareSize,
              height: squareSize,
              left,
              top,
            },
            animatedStyle,
          ]}
        >
          <ChessPiece type={type} color={color} size={squareSize} />

          {/* High-visibility Capture Ring directly over enemy piece */}
          {isLegalTarget && (
            <View
              style={[
                styles.captureRingOverlay,
                {
                  width: squareSize * 0.9,
                  height: squareSize * 0.9,
                  borderRadius: (squareSize * 0.9) / 2,
                },
              ]}
              pointerEvents="none"
            />
          )}
        </Animated.View>
      </GestureDetector>
    );
  }
);

DraggablePiece.displayName = 'DraggablePiece';

const styles = StyleSheet.create({
  pieceContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureRingOverlay: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(216, 64, 64, 0.85)',
    zIndex: 10,
  },
});
