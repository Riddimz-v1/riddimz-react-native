import { StyleSheet, View, Dimensions } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';

const { height } = Dimensions.get('window');

import { useEffect, useState } from 'react';
import { streamingService } from '@/services/api/streaming';
import { FeedItem } from '@/services/api/types';

export default function StreamingScreen() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [currentFeed, setCurrentFeed] = useState<FeedItem | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const data = await streamingService.getFeeds();
        setFeeds(data);
        if (data.length > 0) setCurrentFeed(data[0]);
      } catch (error) {
        console.error('Error fetching feeds:', error);
      }
    };
    fetchFeeds();
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Video Placeholder */}
      <View style={styles.videoPlaceholder}>
           <ThemedText style={styles.liveBadge}>LIVE</ThemedText>
           <View style={styles.overlay}>
                <ThemedText type="defaultSemiBold">{currentFeed?.title || 'User Stream'}</ThemedText>
                <ThemedText>{currentFeed?.type === 'stream' ? 'Live Now' : ''}</ThemedText>
           </View>
      </View>

      <View style={styles.sidebar}>
          <Ionicons name="heart" size={36} color="white" />
          <ThemedText>1.2k</ThemedText>
          <Ionicons name="chatbubble" size={32} color="white" style={{ marginTop: 20 }} />
          <ThemedText>45</ThemedText>
          <Ionicons name="gift" size={32} color={Colors.dark.primary} style={{ marginTop: 20 }} />
          <ThemedText>Gift</ThemedText>
      </View>

      <View style={styles.header}>
           <ThemedText type="subtitle">Streaming</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
      position: 'absolute',
      top: 60,
      left: 20,
      backgroundColor: Colors.dark.accent,
      paddingHorizontal: 8,
      borderRadius: 4,
      fontWeight: 'bold',
  },
  overlay: {
      position: 'absolute',
      bottom: 120,
      left: 20,
  },
  sidebar: {
      position: 'absolute',
      right: 20,
      bottom: 150,
      alignItems: 'center',
  },
  header: {
      position: 'absolute',
      top: 60,
      width: '100%',
      alignItems: 'center',
  }
});
