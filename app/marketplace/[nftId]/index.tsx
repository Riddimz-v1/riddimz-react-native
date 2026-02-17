import { StyleSheet, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { useWallet } from '@/hooks/useWallet';

export default function NFTDetailScreen() {
  const { nftId } = useLocalSearchParams();
  const router = useRouter();
  const { isConnected } = useWallet();

  const handleBuy = () => {
    if (!isConnected) {
        Alert.alert(
            'Connect Wallet',
            'You need to connect your wallet to purchase NFTs.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Connect', onPress: () => router.push('/onboarding/connect-wallet') }
            ]
        );
        return;
    }
    // Proceed with purchase logic
    Alert.alert('Processing', 'Your purchase is being processed on the Solana blockchain.');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.imagePlaceholder} />
      <ThemedText type="title">NFT Detail #{nftId?.slice(0, 8)}</ThemedText>
      <ThemedText style={styles.description}>
        This is a unique music NFT on the Solana blockchain. Own a piece of the track and support the artist directly.
      </ThemedText>
      <View style={styles.footer}>
          <Button title="Buy Now (10 RDMZ)" onPress={handleBuy} />
          <Button title="Back" variant="outline" onPress={() => router.back()} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '80%',
    aspectRatio: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    marginBottom: 30,
  },
  description: {
      textAlign: 'center',
      marginTop: 10,
      opacity: 0.7,
  },
  footer: {
      marginTop: 40,
      width: '100%',
      gap: 10,
  }
});
