import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';

export default function TabScreenHeader({ title, subtitle, rightSlot }) {
  const navigation = useNavigation();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityLabel="Open menu"
        accessibilityRole="button"
        style={styles.menuButton}
        onPress={openDrawer}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rightSlot}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuIcon: {
    fontSize: 22,
    color: COLORS.gray700,
    fontWeight: '700',
    lineHeight: 24,
  },
  titleBlock: { flex: 1 },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  rightSlot: { marginLeft: SPACING.sm },
});
