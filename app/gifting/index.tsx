import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { Colors } from '@/utils/constants';

export default function GiftingScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Send a Gift</ThemedText>
      <View style={styles.grid}>
          {[1, 5, 10, 50].map((amount) => (
              <View key={amount} style={styles.giftOption}>
                  <ThemedText type="subtitle">{amount} RDMZ</ThemedText>
                  <Button title="Send" variant="primary" onPress={() => console.log(`Sending ${amount}`)} />
              </View>
          ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 20,
      marginTop: 40,
  },
  giftOption: {
      width: '40%',
      backgroundColor: '#1E1E1E',
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      gap: 10,
  }
});
