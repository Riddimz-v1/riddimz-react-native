import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { View, StyleSheet, Dimensions, Image, useWindowDimensions, ActivityIndicator } from 'react-native';
import { ThemedText } from '../atoms/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

import { useEffect, useState } from 'react';
import { streamingService } from '@/services/api/streaming';
import { contentService } from '@/services/api/content';
import { karaokeService } from '@/services/api/karaoke';
import { FeedItem } from '@/services/api/types';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';

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
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 10;

    const fetchFeeds = async (isRefresh = false) => {
        if (loading || (!hasMore && !isRefresh)) return;
        
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        const currentSkip = isRefresh ? 0 : skip;
        
        try {
            // Aggregate from multiple sources using the current offset
            const [tracks, podcasts, streams, rooms] = await Promise.all([
                contentService.getTracks(currentSkip, LIMIT / 2),
                contentService.getPodcasts(currentSkip, LIMIT / 2),
                streamingService.getFeeds(currentSkip, LIMIT / 2),
                karaokeService.getRooms(currentSkip, LIMIT / 2)
            ]);

            const aggregated: FeedItem[] = [
                ...tracks.map(t => ({ id: t.id, type: 'track' as const, title: t.title, thumbnail_url: t.cover_url })),
                ...podcasts.map(p => ({ id: p.id, type: 'podcast' as const, title: p.title, thumbnail_url: p.cover_art_url })),
                ...streams,
                ...rooms.map(r => ({ id: r.id, type: 'stream' as const, title: `Karaoke: ${r.name}`, thumbnail_url: undefined }))
            ];

            if (aggregated.length === 0) {
                setHasMore(false);
            } else {
                // Simple shuffle for variety
                const shuffled = aggregated.sort(() => Math.random() - 0.5);
                
                if (isRefresh) {
                    setFeeds(shuffled);
                    setSkip(LIMIT / 2); // Approximation of next skip
                    setHasMore(true);
                } else {
                    setFeeds(prev => [...prev, ...shuffled]);
                    setSkip(prev => prev + (LIMIT / 2));
                }
            }
        } catch (error) {
            console.error('Error fetching feeds:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
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
                onEndReached={() => fetchFeeds(false)}
                onEndReachedThreshold={0.5}
                numColumns={columnCount}
                contentContainerStyle={{ padding: 10 }}
                refreshing={refreshing}
                onRefresh={() => fetchFeeds(true)}
                ListFooterComponent={() => (
                    loading ? (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator color={Colors.dark.primary} />
                        </View>
                    ) : null
                )}
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
