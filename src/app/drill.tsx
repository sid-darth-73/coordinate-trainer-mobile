import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Chess, Square } from 'chess.js';
import { Chessboard } from '../components/Chessboard';
import { DrillHUD } from '../components/DrillHUD';
import { GameOverModal } from '../components/GameOverModal';
import { Colors } from '../constants/colors';
import { fetchPersonalBest, saveScoreResult } from '../db/scoresRepository';
import { useTimer } from '../hooks/useTimer';
import { BoardOrientation, DrillMode, SquareCoordinate } from '../types/chess';
import {
  generateRandomMoveChallenge,
  getRandomSquare,
  MoveChallenge,
} from '../utils/chessUtils';
import { triggerError, triggerSuccess, triggerTap } from '../utils/haptics';

export default function DrillScreen() {
  const params = useLocalSearchParams<{
    mode?: DrillMode;
    duration?: string;
    orientation?: 'white' | 'black' | 'random';
    showLabels?: string;
  }>();

  const mode: DrillMode = (params.mode as DrillMode) || 'empty_board';
  const durationNumber = parseInt(params.duration || '30', 10);
  const showLabels = params.showLabels !== 'false';

  const [emptyBoardOrientation, setEmptyBoardOrientation] = useState<BoardOrientation>(() => {
    if (params.orientation === 'black') return 'black';
    if (params.orientation === 'random') return Math.random() > 0.5 ? 'white' : 'black';
    return 'white';
  });

  // Layout sizing
  const { width } = useWindowDimensions();
  const boardSize = useMemo(() => {
    const maxWidth = Math.min(width - 24, 420);
    return Math.floor(maxWidth / 8) * 8;
  }, [width]);

  // Scoring and attempt stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{
    square: SquareCoordinate;
    status: 'correct' | 'wrong';
  } | null>(null);

  // Game over state
  const [isGameOver, setIsGameOver] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  // Mode A: Empty Board target square
  const [targetSquare, setTargetSquare] = useState<SquareCoordinate>(() => getRandomSquare());

  // Mode B: Piece moves challenge
  const [challenge, setChallenge] = useState<MoveChallenge | null>(() =>
    mode === 'piece_moves' ? generateRandomMoveChallenge() : null
  );
  const [currentFen, setCurrentFen] = useState<string | null>(() =>
    mode === 'piece_moves' ? (challenge ? challenge.fen : null) : null
  );
  const [selectedSquare, setSelectedSquare] = useState<SquareCoordinate | null>(null);
  const [legalTargets, setLegalTargets] = useState<SquareCoordinate[]>([]);

  const activeOrientation: BoardOrientation =
    mode === 'piece_moves' && challenge ? challenge.orientation : emptyBoardOrientation;

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedbackWithDelay = (delayMs: number = 250) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
    }, delayMs);
  };

  // End of game handler
  const handleTimeUp = useCallback(() => {
    setIsGameOver(true);

    if (durationNumber > 0) {
      setScore((currentScore) => {
        setCorrectAttempts((currentCorrect) => {
          setTotalAttempts((currentTotal) => {
            const accuracy = currentTotal > 0 ? (currentCorrect / currentTotal) * 100 : 0;
            const previousBest = fetchPersonalBest(mode, durationNumber);
            const isBest = !previousBest || currentScore > previousBest.best_score;
            setIsNewBest(isBest && currentScore > 0);

            try {
              saveScoreResult(
                mode,
                durationNumber,
                currentScore,
                accuracy,
                currentTotal,
                currentCorrect
              );
            } catch (err) {
              console.error('Failed to save score:', err);
            }

            return currentTotal;
          });
          return currentCorrect;
        });
        return currentScore;
      });
    }
  }, [durationNumber, mode]);

  const { timeLeft, startTimer, resetTimer, stopTimer } = useTimer({
    initialSeconds: durationNumber,
    onTimeUp: handleTimeUp,
  });

  // Start timer on mount
  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [startTimer, stopTimer]);

  // Restart / Play Again
  const handlePlayAgain = () => {
    setIsGameOver(false);
    setIsNewBest(false);
    setScore(0);
    setStreak(0);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setFeedback(null);
    setSelectedSquare(null);
    setLegalTargets([]);

    if (params.orientation === 'random') {
      setEmptyBoardOrientation(Math.random() > 0.5 ? 'white' : 'black');
    }

    if (mode === 'empty_board') {
      setTargetSquare(getRandomSquare());
    } else {
      const nextChallenge = generateRandomMoveChallenge();
      setChallenge(nextChallenge);
      setCurrentFen(nextChallenge.fen);
    }

    resetTimer();
    startTimer();
  };

  const handleExit = () => {
    stopTimer();
    router.back();
  };

  // Square tap handler for Mode A (Empty Board)
  const handleEmptyBoardSquarePress = (square: SquareCoordinate) => {
    if (isGameOver) return;

    setTotalAttempts((prev) => prev + 1);

    if (square === targetSquare) {
      triggerSuccess();
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setCorrectAttempts((prev) => prev + 1);
      setFeedback({ square, status: 'correct' });

      // Pick next target square
      setTargetSquare((prevTarget) => getRandomSquare(prevTarget));

      if (params.orientation === 'random') {
        setEmptyBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
      }

      clearFeedbackWithDelay(180);
    } else {
      triggerError();
      setStreak(0);
      setFeedback({ square, status: 'wrong' });
      clearFeedbackWithDelay(300);
    }
  };

  // Square tap handler for Mode B (Piece Movement)
  const handlePieceMoveSquarePress = (square: SquareCoordinate) => {
    if (isGameOver || !challenge || !currentFen) return;

    const chess = new Chess(currentFen);

    // If no piece is currently selected:
    if (!selectedSquare) {
      const piece = chess.get(square as Square);
      if (piece && piece.color === chess.turn()) {
        triggerTap();
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as Square, verbose: true });
        setLegalTargets(moves.map((m) => m.to as SquareCoordinate));
      }
      return;
    }

    // If clicking the same selected square again, deselect:
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    // If clicking another piece of the current player's color, switch selection:
    const clickedPiece = chess.get(square as Square);
    if (clickedPiece && clickedPiece.color === chess.turn()) {
      triggerTap();
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as Square, verbose: true });
      setLegalTargets(moves.map((m) => m.to as SquareCoordinate));
      return;
    }

    // Attempt to make move from selectedSquare to square
    try {
      const attemptedMove = chess.move({
        from: selectedSquare as Square,
        to: square as Square,
        promotion: 'q',
      });

      if (attemptedMove) {
        setTotalAttempts((prev) => prev + 1);

        // Check if this move matches the target SAN or target move
        const isTarget = attemptedMove.san === challenge.targetSan;

        if (isTarget) {
          triggerSuccess();
          setScore((prev) => prev + 1);
          setStreak((prev) => prev + 1);
          setCorrectAttempts((prev) => prev + 1);
          setFeedback({ square, status: 'correct' });
          setCurrentFen(chess.fen());
          setSelectedSquare(null);
          setLegalTargets([]);

          // Load next challenge after short delay
          setTimeout(() => {
            const nextCh = generateRandomMoveChallenge();
            setChallenge(nextCh);
            setCurrentFen(nextCh.fen);
            setSelectedSquare(null);
            setLegalTargets([]);
            setFeedback(null);
          }, 350);
        } else {
          // Move was legal, but not the requested SAN
          triggerError();
          setStreak(0);
          setFeedback({ square, status: 'wrong' });
          setSelectedSquare(null);
          setLegalTargets([]);
          clearFeedbackWithDelay(350);
        }
      }
    } catch {
      // Illegal move
      triggerError();
      setSelectedSquare(null);
      setLegalTargets([]);
    }
  };

  const handleSquarePress = (square: SquareCoordinate) => {
    if (mode === 'empty_board') {
      handleEmptyBoardSquarePress(square);
    } else {
      handlePieceMoveSquarePress(square);
    }
  };

  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top HUD */}
      <DrillHUD
        mode={mode}
        targetPrompt={mode === 'empty_board' ? targetSquare : challenge?.targetSan ?? '...'}
        promptSubtitle={
          mode === 'empty_board'
            ? `Orientation: ${activeOrientation.toUpperCase()}`
            : `${challenge?.positionName ?? 'Opening'} • ${
                activeOrientation === 'white' ? 'White to Move' : 'Black to Move'
              }`
        }
        score={score}
        streak={streak}
        timeLeft={timeLeft}
        totalDuration={durationNumber}
        onExit={handleExit}
      />

      {/* Board Display Area */}
      <View style={styles.boardWrapper}>
        <Chessboard
          size={boardSize}
          orientation={activeOrientation}
          showLabels={showLabels}
          fen={mode === 'piece_moves' ? currentFen : null}
          selectedSquare={selectedSquare}
          legalTargets={legalTargets}
          feedback={feedback}
          onSquarePress={handleSquarePress}
        />
      </View>

      {/* Game Over Modal */}
      <GameOverModal
        visible={isGameOver}
        score={score}
        accuracy={accuracy}
        correctAttempts={correctAttempts}
        totalAttempts={totalAttempts}
        isNewPersonalBest={isNewBest}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
  },
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
});
