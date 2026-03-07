import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
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
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#6a6a6a',
        tabBarStyle: hideTabs ? { display: 'none' } : Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.9)',
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 20,
            paddingTop: 8,
          },
          default: {
            backgroundColor: '#000',
            borderTopWidth: 0,
            height: 65,
            paddingBottom: 10,
            paddingTop: 8,
          },
        }),
        // THIS is what completes the task - SpotifyMixUI on tab labels
        tabBarLabelStyle: {
          fontFamily: 'SpotifyMixUI-Bold',
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="karaoke/index"
        options={{
          title: 'Sing',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'mic' : 'mic-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library/index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden screens */}
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