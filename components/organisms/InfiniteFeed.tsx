import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { View, StyleSheet, Dimensions, Image, useWindowDimensions } from 'react-native';
import { ThemedText } from '../atoms/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

import { useEffect, useState } from 'react';
import { streamingService } from '@/services/api/streaming';
import { contentService } from '@/services/api/content';
import { karaokeService } from '@/services/api/karaoke';
import { FeedItem } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';

function FeedCard({ item }: { item: FeedItem }) {
    const { colors } = useTheme();
    const imageUrl = item.thumbnail_url || `https://picsum.photos/400/400?random=${item.id}`;
    
    const getIcon = () => {
        switch(item.type) {
            case 'stream': return 'videocam';
            case 'podcast': return 'mic';
            case 'track': return 'musical-notes';
            default: return 'play';
        }
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.secondary }]}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.badge}>
                <Ionicons name={getIcon() as any} size={12} color="#fff" />
                <ThemedText style={styles.badgeText}>{item.type.toUpperCase()}</ThemedText>
            </View>
            <View style={styles.info}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.title}</ThemedText>
                <ThemedText style={{ opacity: 0.7 }} numberOfLines={1}>
                    {item.type === 'stream' ? 'Live Now' : 'New Release'}
                </ThemedText>
            </View>
        </View>
    );
}

export function InfiniteFeed() {
    const { width } = useWindowDimensions();
    const { isLargeScreen, isDesktop } = useResponsive();
    const [feeds, setFeeds] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeeds = async (isRefresh = false) => {
        setLoading(true);
        try {
            // Aggregate from multiple sources
            const [tracks, podcasts, streams, rooms] = await Promise.all([
                contentService.getTracks(0, 5),
                contentService.getPodcasts(0, 5),
                streamingService.getFeeds(0, 5),
                karaokeService.getRooms(0, 5)
            ]);

            const aggregated: FeedItem[] = [
                ...tracks.map(t => ({ id: t.id, type: 'track' as const, title: t.title, thumbnail_url: t.cover_url })),
                ...podcasts.map(p => ({ id: p.id, type: 'podcast' as const, title: p.title, thumbnail_url: p.cover_art_url })),
                ...streams,
                ...rooms.map(r => ({ id: r.id, type: 'stream' as const, title: `Karaoke: ${r.name}`, thumbnail_url: undefined }))
            ];

            // Simple shuffle for variety
            const shuffled = aggregated.sort(() => Math.random() - 0.5);
            setFeeds(shuffled);
        } catch (error) {
            console.error('Error fetching feeds:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeds(true);
    }, []);

    const columnCount = isDesktop ? 6 : isLargeScreen ? 4 : 2;

    return (
        <View style={styles.container}>
            <FlashList<FeedItem>
                data={feeds}
                renderItem={({ item }: ListRenderItemInfo<FeedItem>) => <FeedCard item={item} />}
                onEndReached={() => fetchFeeds()}
                onEndReachedThreshold={0.5}
                numColumns={columnCount}
                contentContainerStyle={{ padding: 10 }}
                refreshing={loading && feeds.length === 0}
                onRefresh={() => fetchFeeds(true)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    card: {
        margin: 8,
        borderRadius: 12,
        overflow: 'hidden',
        height: 260,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 180,
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    info: {
        padding: 10,
    }
});
