import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';

export default function StreamDetailScreen() {
  const { streamId } = useLocalSearchParams();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Live Stream: {streamId}</ThemedText>
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
