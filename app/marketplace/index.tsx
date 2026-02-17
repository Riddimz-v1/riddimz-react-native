import { StyleSheet, View, FlatList } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

import { useEffect, useState } from 'react';
import { marketplaceService } from '@/services/api/marketplace';
import { NFTResponse } from '@/services/api/types';

export default function MarketplaceScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [nfts, setNfts] = useState<NFTResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const data = await marketplaceService.getListings();
                setNfts(data);
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Marketplace</ThemedText>
                <ThemedText>Solana Music NFTs</ThemedText>
            </View>
            <FlatList
                data={nfts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                onRefresh={() => {/* Add refresh logic */}}
                refreshing={loading}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: colors.secondary }]}>
                        <View style={styles.imagePlaceholder} />
                        <ThemedText type="defaultSemiBold">NFT #{item.id.slice(0, 4)}</ThemedText>
                        <ThemedText>{item.price} RDMZ</ThemedText>
                        <Button title="View" variant="outline" onPress={() => router.push(`/marketplace/${item.id}`)} />
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
  card: {
    flex: 1,
    margin: 10,
    padding: 10,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 10,
  },
});
