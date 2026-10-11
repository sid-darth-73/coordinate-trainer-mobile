import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import {
  clearAllScores,
  fetchPersonalBests,
  fetchRecentScores,
} from '../db/scoresRepository';
import { PersonalBest, ScoreRecord } from '../types/chess';
import { triggerTap } from '../utils/haptics';

export default function HistoryScreen() {
  const [bests, setBests] = useState<PersonalBest[]>([]);
  const [recentScores, setRecentScores] = useState<ScoreRecord[]>([]);

  const loadData = useCallback(() => {
    try {
      setBests(fetchPersonalBests());
      setRecentScores(fetchRecentScores(40));
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleClearHistory = () => {
    triggerTap();
    Alert.alert(
      'Reset All Records',
      'Are you sure you want to clear all personal bests and history records? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: () => {
            clearAllScores();
            loadData();
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Personal Bests Section */}
      <Text style={styles.sectionTitle}>PERSONAL BESTS (TIME ATTACK)</Text>
      {bests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No drills recorded yet. Play a time attack to set a record!</Text>
        </View>
      ) : (
        <View style={styles.bestsGrid}>
          {bests.map((best, idx) => (
            <View key={idx} style={styles.bestCard}>
              <View style={styles.bestCardHeader}>
                <Ionicons name="trophy" size={16} color="#FFD700" />
                <Text style={styles.bestModeText}>
                  {best.mode === 'empty_board' ? 'Coordinates' : 'Piece Moves'} ({best.duration}s)
                </Text>
              </View>
              <Text style={styles.bestScoreNum}>{best.best_score}</Text>
              <Text style={styles.bestAccuracyText}>
                Top Accuracy: {best.best_accuracy.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent History Section Header */}
      <View style={styles.recentHeaderRow}>
        <Text style={styles.sectionTitle}>RECENT SESSIONS</Text>
        {recentScores.length > 0 && (
          <Pressable onPress={handleClearHistory} hitSlop={10}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={recentScores}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          bests.length === 0 ? null : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent sessions.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <View style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <View style={styles.modeIcon}>
                  <Ionicons
                    name={item.mode === 'empty_board' ? 'grid-outline' : 'navigate-outline'}
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.rowModeTitle}>
                    {item.mode === 'empty_board' ? 'Coordinates' : 'Piece Moves'}
                    {item.duration > 0 ? ` (${item.duration}s)` : ' (Practice)'}
                  </Text>
                  <Text style={styles.rowDateText}>{dateStr}</Text>
                </View>
              </View>

              <View style={styles.historyRight}>
                <Text style={styles.rowScoreText}>{item.score} pts</Text>
                <Text style={styles.rowAccuracyText}>{item.accuracy.toFixed(0)}% acc</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  bestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  bestCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bestModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  bestScoreNum: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
  },
  bestAccuracyText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowModeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  rowDateText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  rowScoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  rowAccuracyText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});
