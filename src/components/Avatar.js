import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const isUrl = (s) =>
  typeof s === 'string' && /^https?:\/\//i.test(s);

/**
 * Profile avatar that renders any of:
 *   - photo URL (https://...)        → Image
 *   - emoji  ('👤', '🧒', ...)        → Text
 *   - nothing                         → first letter of `name`
 *
 * Props:
 *   value         — the avatar string from the profile (url OR emoji)
 *   name          — used for the fallback initial
 *   size          — diameter in px (default 48)
 *   backgroundColor — bg colour for non-photo avatars
 *   emojiSize     — override emoji font size
 *   style         — extra container style
 */
export default function Avatar({
  value,
  name,
  size = 48,
  backgroundColor,
  emojiSize,
  style,
}) {
  const radius = size / 2;
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const bg = backgroundColor || COLORS.primary;

  if (isUrl(value)) {
    return (
      <Image
        source={{ uri: value }}
        style={[
          { width: size, height: size, borderRadius: radius, backgroundColor: bg },
          style,
        ]}
        // Background colour shows briefly while the photo loads.
      />
    );
  }

  const isEmoji =
    typeof value === 'string' && value.trim().length > 0 && !isUrl(value);

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius, backgroundColor: bg },
        style,
      ]}
    >
      {isEmoji ? (
        <Text style={{ fontSize: emojiSize || Math.round(size * 0.5) }}>
          {value}
        </Text>
      ) : (
        <Text
          style={{
            color: COLORS.white,
            fontWeight: '800',
            fontSize: Math.round(size * 0.4),
          }}
        >
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
