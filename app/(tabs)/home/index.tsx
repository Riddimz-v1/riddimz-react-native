import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { InfiniteFeed } from '@/components/organisms/InfiniteFeed';
import { Logo } from '@/components/atoms/Logo';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
            <Logo size={32} />
            <ThemedText type="title">For You</ThemedText>
        </View>
      </View>
      <InfiniteFeed />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Status bar path
  },
  header: {
      paddingHorizontal: 20,
      marginBottom: 10,
  },
  headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
});
