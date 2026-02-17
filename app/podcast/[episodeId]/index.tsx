import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';

export default function PodcastEpisodeScreen() {
  const { episodeId } = useLocalSearchParams();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Episode: {episodeId}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
