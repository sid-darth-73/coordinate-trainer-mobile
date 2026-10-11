import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { DrillMode } from '../types/chess';

interface DrillHUDProps {
  mode: DrillMode;
  targetPrompt: string;
  promptSubtitle?: string;
  score: number;
  streak: number;
  timeLeft: number;
  totalDuration: number;
  onExit: () => void;
}

export const DrillHUD: React.FC<DrillHUDProps> = ({
  mode,
  targetPrompt,
  promptSubtitle,
  score,
  streak,
  timeLeft,
  totalDuration,
  onExit,
}) => {
  const isTimeAttack = totalDuration > 0;
  const isTimeLow = isTimeAttack && timeLeft <= 5;

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <Pressable style={styles.exitButton} onPress={onExit} hitSlop={12}>
          <Ionicons name="close" size={24} color={Colors.textMuted} />
        </Pressable>

        {/* Timer / Practice Badge */}
        {isTimeAttack ? (
          <View style={[styles.timerBadge, isTimeLow && styles.timerBadgeWarning]}>
            <Ionicons
              name="time-outline"
              size={18}
              color={isTimeLow ? Colors.danger : Colors.text}
            />
            <Text style={[styles.timerText, isTimeLow && styles.timerTextWarning]}>
              {timeLeft}s
            </Text>
          </View>
        ) : (
          <View style={styles.practiceBadge}>
            <Ionicons name="infinite-outline" size={18} color={Colors.accent} />
            <Text style={styles.practiceText}>Practice</Text>
          </View>
        )}

        {/* Score & Streak */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          {streak > 1 && (
            <View style={styles.streakBox}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Target Prompt Hero Box */}
      <View style={styles.promptCard}>
        <Text style={styles.promptModeHint}>
          {mode === 'empty_board' ? 'FIND SQUARE' : 'PLAY MOVE'}
        </Text>
        <Text style={styles.promptText}>{targetPrompt}</Text>
        {promptSubtitle ? (
          <Text style={styles.promptSubtitle}>{promptSubtitle}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timerBadgeWarning: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  timerTextWarning: {
    color: Colors.danger,
  },
  practiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  practiceText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accent,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBox: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  streakBox: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  promptCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  promptModeHint: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  promptText: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 1,
  },
  promptSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSubtle,
    fontWeight: '500',
  },
});
