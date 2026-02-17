import { useViralityStore } from '@/stores/virality';

export function useViralityFeed() {
    const { feedItems, refreshFeed, likeItem } = useViralityStore();

    const getSortedFeed = () => {
        // recency * likes * follows logic would go here
        return feedItems;
    };

    return {
        feed: getSortedFeed(),
        refresh: refreshFeed,
        like: likeItem
    };
}
