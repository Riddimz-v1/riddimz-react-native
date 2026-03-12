import 'react-native-get-random-values'; // MUST be first import - polyfills crypto.getRandomValues() for @solana/web3.js
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ResponsiveLayout } from '@/components/layouts/ResponsiveLayout';
import { storage } from '@/utils/storage';

// Import global CSS for web
if (Platform.OS === 'web') {
  require('../global.css');
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpotifyMixUI-Regular': require('../assets/fonts/spotify_mix_ui_regular.otf'),
    'SpotifyMixUI-Bold': require('../assets/fonts/spotify_mix_ui_bold.otf'),
    'SpotifyMixUI-TitleBold': require('../assets/fonts/spotify_mix_ui_title_bold.otf'),
    'SpotifyMixUI-TitleExtraBold': require('../assets/fonts/spotify_mix_ui_title_extrabold.otf'),
  });

  useEffect(() => {
    async function checkAuth() {
        const token = await storage.getItem('auth_token');
        const inAuthGroup = segments[0] === '(tabs)';
        
        if (!token && inAuthGroup) {
            // Redirect to the onboarding page if they are trying to access protected routes
            // We return early to avoid setting isAuthChecking to false, 
            // which keeps the screen blank while redirecting
            router.replace('/onboarding');
            return;
        }
        setIsAuthChecking(false);
    }

    if (loaded) {
      SplashScreen.hideAsync();
      checkAuth();
    }
  }, [loaded, segments]);

  if (!loaded || isAuthChecking) {
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
