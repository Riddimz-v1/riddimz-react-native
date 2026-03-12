import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { storage } from '@/utils/storage';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Colors } from '@/utils/constants';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  const [hasAuth, setHasAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
        try {
            const consent = await storage.getItem('gdpr_consent');
            if (consent === 'true') {
                setHasConsent(true);
            }

            const token = await storage.getItem('auth_token');
            if (token) {
                // Validate token by fetching profile
                try {
                    // Import services dynamically to avoid circular dependencies
                    const { useUserStore } = require('@/stores/user');
                    const { useWalletStore } = require('@/stores/wallet');
                    
                    // Fetch and sync profile
                    await useUserStore.getState().fetchProfile();
                    
                    // Verify if profile was actually fetched
                    if (useUserStore.getState().profile) {
                        setHasAuth(true);
                        // Connect wallet store to fetch balances/address
                        try {
                            await useWalletStore.getState().connect();
                        } catch (walletErr) {
                            console.log('Wallet initialization failed in Index:', walletErr);
                        }
                    } else {
                        // Profile fetch returned null/failed
                        setHasAuth(false);
                    }
                } catch (err: any) {
                    console.log('Token validation failed:', err.message);
                    if (err.status === 401) {
                        await storage.removeItem('auth_token');
                    }
                    setHasAuth(false);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsReady(true);
        }
    }
    checkAuth();
  }, []);

  if (!isReady) {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background }}>
              <Stack.Screen options={{ headerShown: false }} />
              <ActivityIndicator size="large" color={Colors.dark.primary} />
          </View>
      );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {hasConsent && hasAuth ? (
          <Redirect href="/(tabs)/home" />
      ) : (
          <Redirect href="/onboarding" />
      )}
    </>
  );
}
