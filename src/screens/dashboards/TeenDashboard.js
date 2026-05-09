import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';
import { useAuth } from '../../../App';

export default function TeenDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = async () => {
    await signOut();
  };

  const WORKSHEETS = [
    { id: 1, title: 'Anxiety Management', category: 'CBT', progress: 60 },
    { id: 2, title: 'Social Skills', category: 'Social', progress: 40 },
    { id: 3, title: 'Sleep Hygiene', category: 'Wellness', progress: 80 },
    { id: 4, title: 'Stress Relief', category: 'DBT', progress: 30 },
  ];

  const RECENT_REFLECTIONS = [
    { date: 'Today', emotion: '😌', text: 'Feeling calmer after breathing exercise' },
    { date: 'Yesterday', emotion: '😰', text: 'Had anxiety about presentation' },
    { date: '2 days ago', emotion: '😊', text: 'Great day with friends' },
  ];

  if (activeTab === 'insights') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Insights</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mood Trends</Text>
            <View style={styles.trendChart}>
              <View style={[styles.trendBar, { height: '30%' }]} />
              <View style={[styles.trendBar, { height: '50%' }]} />
              <View style={[styles.trendBar, { height: '70%' }]} />
              <View style={[styles.trendBar, { height: '60%' }]} />
              <View style={[styles.trendBar, { height: '80%' }]} />
              <View style={[styles.trendBar, { height: '75%' }]} />
              <View style={[styles.trendBar, { height: '85%' }]} />
            </View>
            <Text style={styles.insightText}>Your mood has improved by 25% this week!</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Triggers</Text>
            <View style={styles.triggerList}>
              <View style={styles.triggerItem}>
                <Text style={styles.triggerLabel}>School Pressure</Text>
                <Text style={styles.triggerCount}>45%</Text>
              </View>
              <View style={styles.triggerItem}>
                <Text style={styles.triggerLabel}>Sleep Deprivation</Text>
                <Text style={styles.triggerCount}>30%</Text>
              </View>
              <View style={styles.triggerItem}>
                <Text style={styles.triggerLabel}>Social Anxiety</Text>
                <Text style={styles.triggerCount}>25%</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'insights'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home' ? '🏠 Home' : '📊 Insights'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Check-in</Text>
          <Text style={styles.checkInQuestion}>How are you feeling right now?</Text>
          <View style={styles.emotionScale}>
            {['😢', '😐', '😊', '😄'].map((emoji, i) => (
              <TouchableOpacity key={i} style={styles.emotionButton}>
                <Text style={styles.emotionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Active Worksheets</Text>
          {WORKSHEETS.map(ws => (
            <View key={ws.id} style={styles.worksheetItem}>
              <View>
                <Text style={styles.worksheetTitle}>{ws.title}</Text>
                <Text style={styles.worksheetCategory}>{ws.category}</Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{ws.progress}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Reflections</Text>
          {RECENT_REFLECTIONS.map((ref, i) => (
            <View key={i} style={styles.reflectionItem}>
              <Text style={styles.reflectionEmoji}>{ref.emotion}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.reflectionDate}>{ref.date}</Text>
                <Text style={styles.reflectionText}>{ref.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {['home', 'insights'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabLabel}>
              {tab === 'home' ? '🏠 Home' : '📊 Insights'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  greeting: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  checkInQuestion: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  emotionScale: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emotionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray50,
  },
  emotionEmoji: {
    fontSize: TYPOGRAPHY['2xl'],
  },
  worksheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  worksheetTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  worksheetCategory: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reflectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: SPACING.md,
  },
  reflectionEmoji: {
    fontSize: TYPOGRAPHY.lg,
  },
  reflectionDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  reflectionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: SPACING.md,
  },
  trendBar: {
    width: 30,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xs,
  },
  insightText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  triggerList: {
    gap: SPACING.md,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  triggerLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  triggerCount: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  tabItem: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryLighter,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
  },
});
