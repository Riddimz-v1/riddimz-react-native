import { useColorScheme, Platform } from 'react-native';
import { Colors } from '../utils/constants';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  
  // Force dark mode for web (Spotify-like), respect system preference on native
  const colorScheme = Platform.OS === 'web' ? 'dark' : (systemColorScheme ?? 'dark');
  
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = colorScheme === 'dark';

  return {
    theme,
    isDark,
    colors: theme,
  };
}
