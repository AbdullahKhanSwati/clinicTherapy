import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSafeGoBack from '../../hooks/useSafeGoBack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import { getCurrentProfile, listAffirmations } from '../../services/api';

export default function AffirmationsScreen({ navigation }) {
  const goBack = useSafeGoBack();
  const [affirmations, setAffirmations] = useState([]);
  const [user, setUser] = useState(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, list] = await Promise.all([
          getCurrentProfile(),
          listAffirmations(),
        ]);
        setUser(u);
        // Filter by audience: show 'all' + this user's role
        const role = u?.role;
        const filtered = (list || []).filter(
          (a) => !a.audience || a.audience === 'all' || a.audience === role
        );
        setAffirmations(filtered);
        setIndex(
          filtered.length > 0 ? Math.floor(Math.random() * filtered.length) : 0
        );
      } catch (e) {
        console.log('[Affirmations] load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const current = affirmations[index] || null;

  const next = () => {
    if (affirmations.length <= 1) return;
    let n;
    do {
      n = Math.floor(Math.random() * affirmations.length);
    } while (n === index);
    setIndex(n);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Today's Affirmation</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : !current ? (
          <>
            <Text style={styles.heart}>💖</Text>
            <Text style={styles.helper}>
              No affirmations available yet. Check back soon.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.heart}>💖</Text>
            <View style={styles.card}>
              {current.category ? (
                <Text style={styles.category}>
                  {String(current.category).toUpperCase()}
                </Text>
              ) : null}
              <Text style={styles.quote}>“{current.text}”</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={next}>
              <Text style={styles.primaryBtnText}>Show me another</Text>
            </TouchableOpacity>
            <Text style={styles.helper}>
              Read it out loud. Read it again. Believe it.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backButton: { color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.primary },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  heart: { fontSize: 64, marginBottom: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },
  quote: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 32,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING['2xl'],
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  helper: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
  },
});
