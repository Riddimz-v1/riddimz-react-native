import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ResponsiveLayout } from '@/components/layouts/ResponsiveLayout';

// Import global CSS for web
if (Platform.OS === 'web') {
  require('../global.css');
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpotifyMixUI-Regular': require('../assets/fonts/spotify_mix_ui_regular.otf'),
    'SpotifyMixUI-Bold': require('../assets/fonts/spotify_mix_ui_bold.otf'),
    'SpotifyMixUI-TitleBold': require('../assets/fonts/spotify_mix_ui_title_bold.otf'),
    'SpotifyMixUI-TitleExtraBold': require('../assets/fonts/spotify_mix_ui_title_extrabold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ResponsiveLayout>
          <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
          </Stack>
        </ResponsiveLayout>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
