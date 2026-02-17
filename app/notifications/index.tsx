import { StyleSheet, View, FlatList } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';

export default function NotificationsScreen() {
    const notifications = [
        { id: '1', text: 'Someone liked your karaoke session', time: '2m ago' },
        { id: '2', text: 'New NFT minted in marketplace', time: '1h ago' },
        { id: '3', text: 'Gift received: 5 RDMZ', time: '5h ago' },
    ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
          <ThemedText type="title">Notifications</ThemedText>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ThemedText>{item.text}</ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>{item.time}</ThemedText>
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
  item: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
  }
});
