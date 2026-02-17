import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

export default function TabLayout() {
  const { colors } = useTheme();
  const { isLargeScreen } = useResponsive();

  const isWeb = Platform.OS === 'web';
  const hideTabs = isLargeScreen && isWeb;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarStyle: hideTabs ? { display: 'none' } : Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.8)', // Darker background for spotify vibes
            borderTopWidth: 0,
          },
          default: {
             backgroundColor: colors.background,
             borderTopColor: '#333',
          },
        }),
      }}>
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="karaoke/index"
        options={{
          title: 'Karaoke',
          tabBarLabel: 'Sing',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="mic" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library/index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="library" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
        }}
      />
      
      {/* Hidden tabs that might be navigated to but not on the bar directly if needed, or structured differently */}
      <Tabs.Screen name="karaoke/create" options={{ href: null }} />
      <Tabs.Screen name="karaoke/[roomId]/index" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="profile/wallet/index" options={{ href: null }} />
      <Tabs.Screen name="profile/wallet/send" options={{ href: null }} />
      <Tabs.Screen name="profile/wallet/receive" options={{ href: null }} />
      <Tabs.Screen name="profile/wallet/export-key" options={{ href: null }} />

    </Tabs>
  );
}
