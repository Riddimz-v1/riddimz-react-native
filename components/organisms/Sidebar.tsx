import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../atoms/ThemedText';
import { Logo } from '../atoms/Logo';
import { useTheme } from '@/hooks/useTheme';

const NAV_ITEMS = [
  { label: 'Home', icon: 'home', route: '/home' },
  { label: 'Search', icon: 'search', route: '/search' },
  { label: 'Karaoke', icon: 'mic', route: '/karaoke' },
  { label: 'Library', icon: 'library', route: '/library' },
  { label: 'Profile', icon: 'person', route: '/profile' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <View style={styles.header}>
        <Logo size={32} />
        <ThemedText type="subtitle" style={styles.brandTitle}>Riddimz</ThemedText>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.navSection}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.route);
            return (
              <TouchableOpacity
                key={item.route}
                style={styles.navItem}
                onPress={() => router.push(item.route as any)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={isActive ? colors.primary : '#b3b3b3'}
                />
                <ThemedText
                  style={[
                    styles.navLabel,
                    { color: isActive ? '#fff' : '#b3b3b3' }
                  ]}
                  type="defaultSemiBold"
                >
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        <View style={styles.librarySection}>
          <TouchableOpacity style={styles.navItem}>
             <View style={[styles.playlistIcon, { backgroundColor: '#333' }]}>
                <Ionicons name="add" size={24} color="#fff" />
             </View>
             <ThemedText style={styles.navLabel}>Create Playlist</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
             <View style={[styles.playlistIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="heart" size={20} color="#fff" />
             </View>
             <ThemedText style={styles.navLabel}>Liked Songs</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: '100%',
    paddingTop: 40,
    borderRightWidth: 1,
    borderRightColor: '#121212',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTitle: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  navSection: {
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 16,
  },
  navLabel: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  divider: {
    height: 1,
    backgroundColor: '#282828',
    marginHorizontal: 24,
    marginVertical: 12,
  },
  librarySection: {
    paddingHorizontal: 12,
  },
  playlistIcon: {
    width: 24,
    height: 24,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
