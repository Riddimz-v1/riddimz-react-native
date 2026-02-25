import { StyleSheet, View, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { Colors } from '@/utils/constants';

import { useEffect, useState } from 'react';
import { karaokeService } from '@/services/api/karaoke';
import { RoomResponse } from '@/services/api/types';
import { useUserStore } from '@/stores/user';

export default function KaraokeScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await karaokeService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching karaoke rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const myUserId = profile?.id?.toString();
  const myRooms = rooms.filter(r => r.host_id === myUserId);
  const otherRooms = rooms.filter(r => r.host_id !== myUserId);

  const renderRoom = (item: RoomResponse) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.roomCard}
      onPress={() => router.push(`/(tabs)/karaoke/${item.id}`)}
    >
      <View style={styles.roomImagePlaceholder}>
          <Ionicons name="mic-outline" size={32} color="rgba(255,255,255,0.3)" />
          <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
          </View>
      </View>
      <View style={styles.roomInfo}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.name}</ThemedText>
        <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={14} color="#999" />
            <ThemedText style={styles.metaText}>{item.queue.length + 1} performers</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Sing & Watch</ThemedText>
        <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push('/(tabs)/karaoke/create')}
        >
            <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRooms} tintColor="#fff" />
        }
      >
        {myRooms.length > 0 && (
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Your Live Rooms</ThemedText>
                <View style={styles.grid}>
                    {myRooms.map(renderRoom)}
                </View>
            </View>
        )}

        <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Trending Now</ThemedText>
            {otherRooms.length > 0 ? (
                <View style={styles.grid}>
                    {otherRooms.map(renderRoom)}
                </View>
            ) : (
                <View style={styles.empty}>
                    <ThemedText style={styles.emptyText}>No other live rooms right now.</ThemedText>
                </View>
            )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scroll: {
      flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
      fontSize: 28,
  },
  addButton: {
      backgroundColor: Colors.dark.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
  },
  section: {
      marginBottom: 30,
      paddingHorizontal: 20,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#fff',
  },
  grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 15,
  },
  roomCard: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 5,
  },
  roomImagePlaceholder: {
      aspectRatio: 1,
      backgroundColor: '#222',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
  },
  liveBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: '#ff4444',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  },
  liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#fff',
  },
  liveText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#fff',
  },
  roomInfo: {
      padding: 12,
  },
  metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  empty: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  emptyText: {
      color: '#666',
      fontSize: 14,
  }
});
