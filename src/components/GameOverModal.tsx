import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  accuracy: number;
  correctAttempts: number;
  totalAttempts: number;
  isNewPersonalBest: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  accuracy,
  correctAttempts,
  totalAttempts,
  isNewPersonalBest,
  onPlayAgain,
  onExit,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {isNewPersonalBest && (
            <View style={styles.bestBanner}>
              <Ionicons name="trophy" size={18} color="#FFD700" />
              <Text style={styles.bestBannerText}>NEW PERSONAL BEST!</Text>
            </View>
          )}

          <Text style={styles.title}>{"Time's Up!"}</Text>

          {/* Main Score Hero */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>Final Score</Text>
          </View>

          {/* Stat Details Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{accuracy.toFixed(0)}%</Text>
              <Text style={styles.statItemLabel}>Accuracy</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{correctAttempts}</Text>
              <Text style={styles.statItemLabel}>Correct</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{totalAttempts - correctAttempts}</Text>
              <Text style={styles.statItemLabel}>Missed</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.playAgainButton} onPress={onPlayAgain}>
              <Ionicons name="reload" size={18} color={Colors.primaryText} />
              <Text style={styles.playAgainText}>Play Again</Text>
            </Pressable>

            <Pressable style={styles.exitButton} onPress={onExit}>
              <Ionicons name="home-outline" size={18} color={Colors.text} />
              <Text style={styles.exitText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  bestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: '#FFD700',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  bestBannerText: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 70,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  statItemValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  statItemLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  playAgainButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playAgainText: {
    color: Colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  exitButton: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exitText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
