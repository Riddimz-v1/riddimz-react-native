import { StyleSheet, View, FlatList } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';

export default function PodcastScreen() {
    const episodes = Array.from({ length: 10 }).map((_, i) => ({ id: `${i}`, title: `Episode #${i}`, duration: '45 min' }));

  return (
    <ThemedView style={styles.container}>
        <View style={styles.header}>
            <ThemedText type="title">Podcasts</ThemedText>
            <ThemedText>Latest from the community</ThemedText>
        </View>
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.episodeCard}>
            <View style={styles.thumbnail} />
            <View style={styles.info}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText style={{ opacity: 0.7 }}>{item.duration}</ThemedText>
            </View>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
  },
  episodeCard: {
      flexDirection: 'row',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
      alignItems: 'center',
  },
  thumbnail: {
      width: 60,
      height: 60,
      backgroundColor: '#333',
      borderRadius: 4,
  },
  info: {
      marginLeft: 15,
  }
});
