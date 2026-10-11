import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchPersonalBests } from '../db/scoresRepository';
import { DrillDuration, DrillMode, PersonalBest } from '../types/chess';
import { triggerTap } from '../utils/haptics';

export default function HomeScreen() {
  const [mode, setMode] = useState<DrillMode>('empty_board');
  const [duration, setDuration] = useState<DrillDuration>(30);
  const [orientation, setOrientation] = useState<'white' | 'black' | 'random'>('white');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [bests, setBests] = useState<PersonalBest[]>([]);

  useFocusEffect(
    useCallback(() => {
      try {
        const loadedBests = fetchPersonalBests();
        setBests(loadedBests);
      } catch (err) {
        console.error('Error fetching bests:', err);
      }
    }, [])
  );

  const getBestForCurrent = () => {
    return bests.find((b) => b.mode === mode && b.duration === duration);
  };

  const handleStartDrill = () => {
    triggerTap();
    router.push({
      pathname: '/drill',
      params: {
        mode,
        duration: duration.toString(),
        orientation,
        showLabels: showLabels ? 'true' : 'false',
      },
    });
  };

  const currentBest = getBestForCurrent();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="grid" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.title}>CHESS COORDINATES</Text>
          <Text style={styles.subtitle}>Train your board vision & notation reflexes</Text>
        </View>

        {/* Current Selection Personal Best Banner */}
        {duration > 0 && (
          <View style={styles.bestCard}>
            <View style={styles.bestLeft}>
              <Ionicons name="trophy" size={22} color="#FFD700" />
              <View>
                <Text style={styles.bestTitle}>
                  {duration}s {mode === 'empty_board' ? 'Coordinates' : 'Piece Moves'} Best
                </Text>
                <Text style={styles.bestSubtitle}>
                  {currentBest
                    ? `Accuracy: ${currentBest.best_accuracy.toFixed(0)}%`
                    : 'No record yet. Set one now!'}
                </Text>
              </View>
            </View>
            <Text style={styles.bestScoreText}>{currentBest ? currentBest.best_score : '—'}</Text>
          </View>
        )}

        {/* 1. Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. DRILL MODE</Text>
          <View style={styles.modeCardsContainer}>
            <Pressable
              style={[
                styles.modeCard,
                mode === 'empty_board' && styles.modeCardActive,
              ]}
              onPress={() => {
                triggerTap();
                setMode('empty_board');
              }}
            >
              <View style={styles.modeIconWrapper}>
                <Ionicons
                  name="tablet-portrait-outline"
                  size={24}
                  color={mode === 'empty_board' ? Colors.primary : Colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.modeCardTitle,
                  mode === 'empty_board' && styles.modeCardTitleActive,
                ]}
              >
                Empty Board
              </Text>
              <Text style={styles.modeCardDesc}>
                Tap the announced square as quickly as possible.
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.modeCard,
                mode === 'piece_moves' && styles.modeCardActive,
              ]}
              onPress={() => {
                triggerTap();
                setMode('piece_moves');
              }}
            >
              <View style={styles.modeIconWrapper}>
                <Ionicons
                  name="navigate-outline"
                  size={24}
                  color={mode === 'piece_moves' ? Colors.primary : Colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.modeCardTitle,
                  mode === 'piece_moves' && styles.modeCardTitleActive,
                ]}
              >
                Piece Movement
              </Text>
              <Text style={styles.modeCardDesc}>
                Execute algebraic moves (e.g. Bg6, Nxe5) on the board.
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 2. Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. TIME ATTACK</Text>
          <View style={styles.segmentedRow}>
            {([30, 60, 0] as DrillDuration[]).map((d) => (
              <Pressable
                key={d}
                style={[
                  styles.segmentedBtn,
                  duration === d && styles.segmentedBtnActive,
                ]}
                onPress={() => {
                  triggerTap();
                  setDuration(d);
                }}
              >
                <Text
                  style={[
                    styles.segmentedBtnText,
                    duration === d && styles.segmentedBtnTextActive,
                  ]}
                >
                  {d === 0 ? 'Practice' : `${d} Seconds`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 3. Orientation Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. PERSPECTIVE</Text>
          <View style={styles.segmentedRow}>
            {(['white', 'black', 'random'] as const).map((o) => (
              <Pressable
                key={o}
                style={[
                  styles.segmentedBtn,
                  orientation === o && styles.segmentedBtnActive,
                ]}
                onPress={() => {
                  triggerTap();
                  setOrientation(o);
                }}
              >
                <Text
                  style={[
                    styles.segmentedBtnText,
                    orientation === o && styles.segmentedBtnTextActive,
                  ]}
                >
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 4. Settings Toggle: Edge Labels */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Coordinate Labels</Text>
              <Text style={styles.toggleDesc}>Show rank (1-8) and file (a-h) on board edge</Text>
            </View>
            <Switch
              value={showLabels}
              onValueChange={(val) => {
                triggerTap();
                setShowLabels(val);
              }}
              trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        {/* Start Button */}
        <Pressable style={styles.startButton} onPress={handleStartDrill}>
          <Ionicons name="play" size={22} color={Colors.primaryText} />
          <Text style={styles.startButtonText}>START DRILL</Text>
        </Pressable>

        {/* History & Records Link */}
        <Pressable
          style={styles.historyLink}
          onPress={() => {
            triggerTap();
            router.push('/history');
          }}
        >
          <Ionicons name="stats-chart" size={18} color={Colors.textMuted} />
          <Text style={styles.historyLinkText}>View Leaderboard & History</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  bestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  bestSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bestScoreText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  modeCardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(129, 182, 76, 0.08)',
  },
  modeIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  modeCardTitleActive: {
    color: Colors.primary,
  },
  modeCardDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentedBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentedBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentedBtnTextActive: {
    color: Colors.primaryText,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 6,
  },
  startButtonText: {
    color: Colors.primaryText,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 8,
  },
  historyLinkText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
