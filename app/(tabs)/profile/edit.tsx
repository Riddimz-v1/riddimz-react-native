import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { useRouter } from 'expo-router';

export default function ProfileEditScreen() {
    const router = useRouter();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Edit Profile</ThemedText>
      <Button title="Save Changes" onPress={() => router.back()} />
      <Button title="Cancel" variant="outline" onPress={() => router.back()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20
  },
});
