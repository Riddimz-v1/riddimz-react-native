import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { InfiniteFeed } from '@/components/organisms/InfiniteFeed';
import { Logo } from '@/components/atoms/Logo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/user';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useUserStore();

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Logo size={32} />
          {/* type="title" uses SpotifyMixUI-TitleBold already via ThemedText */}
          <ThemedText type="title" style={styles.greeting}>
            {getGreeting()}
          </ThemedText>
        </View>

        {/* Right side icons — Spotify pattern */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Filter Pills — Spotify pattern */}
      <View style={styles.pillRow}>
        <TouchableOpacity style={[styles.pill, styles.pillActive]}>
          {/* type="defaultSemiBold" uses SpotifyMixUI-Bold already */}
          <ThemedText type="defaultSemiBold" style={styles.pillTextActive}>
            All
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <ThemedText type="defaultSemiBold" style={styles.pillText}>
            Music
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <ThemedText type="defaultSemiBold" style={styles.pillText}>
            Karaoke
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <ThemedText type="defaultSemiBold" style={styles.pillText}>
            Podcasts
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <InfiniteFeed />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // ---- existing styles kept exactly ----
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // ---- new styles added ----
  greeting: {
    fontSize: 22, // slightly smaller so it fits inline with logo
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 6,
  },
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
  },
  pillActive: {
    backgroundColor: '#fff',
  },
  pillText: {
    fontSize: 13,
    color: '#fff',
  },
  pillTextActive: {
    fontSize: 13,
    color: '#000',
  },
});