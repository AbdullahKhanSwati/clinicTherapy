import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

/**
 * Returns a function that pops the current screen if there's a previous one,
 * otherwise falls back to navigating to a sensible default. Use this in any
 * screen that might be reached as the initial route of its stack — e.g. via
 * the drawer — where `navigation.goBack()` would otherwise dispatch a GO_BACK
 * action that no navigator can handle.
 *
 * Usage:
 *   const goBack = useSafeGoBack();
 *   <TouchableOpacity onPress={goBack}>← Back</TouchableOpacity>
 *
 * Optional argument: fallback screen name to navigate to (default 'Home').
 */
export default function useSafeGoBack(fallback = 'Home') {
  const navigation = useNavigation();
  return useCallback(() => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
    } else {
      try {
        navigation.navigate(fallback);
      } catch (_) {
        /* last-resort no-op */
      }
    }
  }, [navigation, fallback]);
}
