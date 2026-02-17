import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
      </View>
      
      <View style={styles.section}>
          <ThemedText type="subtitle">Account</ThemedText>
          <ThemedText style={styles.item}>Edit Profile</ThemedText>
          <ThemedText style={styles.item}>Wallet Security</ThemedText>
      </View>

      <View style={styles.section}>
          <ThemedText type="subtitle">Compliance</ThemedText>
          <ThemedText style={styles.item}>Data Export (GDPR)</ThemedText>
          <ThemedText style={styles.item}>Delete Account</ThemedText>
      </View>

      <Button title="Back" variant="outline" onPress={() => router.back()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  section: {
      marginBottom: 30,
  },
  item: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
  }
});
