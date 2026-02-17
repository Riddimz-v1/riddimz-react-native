import { create } from 'zustand';
import { contentService } from '../services/api/content';
import { streamingService } from '../services/api/streaming';

interface ViralityState {
    feedItems: any[];
    refreshFeed: () => Promise<void>;
    likeItem: (id: string) => void;
}

export const useViralityStore = create<ViralityState>((set) => ({
    feedItems: [],
    refreshFeed: async () => {
        try {
            const [tracks, feeds] = await Promise.all([
                contentService.getTracks(0, 10),
                streamingService.getFeeds(0, 10)
            ]);
            
            // Merge and "viralize" (sorting simplified for integration)
            const combined = [...tracks.map(t => ({ ...t, type: 'track' })), ...feeds];
            set({ feedItems: combined });
        } catch (error) {
            console.error('Error refreshing virality feed:', error);
        }
    },
    likeItem: (id) => {
        console.log(`Liked item ${id}`);
    }
}));
