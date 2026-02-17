import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { Logo } from '@/components/atoms/Logo';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Logo size={120} style={styles.logo} />
        <ThemedText style={styles.subtitle}>
          Karaoke. Podcasts. Streaming. {'\n'} 
          Web3 Music Revolution.
        </ThemedText>
      </View>
      
      <View style={styles.footer}>
        <Button 
            title="Create Account" 
            onPress={() => router.push('/onboarding/signup')} 
        />
        <Button 
            title="Log In" 
            variant="outline"
            onPress={() => router.push('/onboarding/login')} 
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 50,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 20,
    opacity: 0.9,
    lineHeight: 28,
  },
  footer: {
    paddingBottom: 50,
  }
});
