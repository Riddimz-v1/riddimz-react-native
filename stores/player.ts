import { create } from 'zustand';

interface Track {
    id: string;
    title: string;
    artist: string;
    artwork: string; // URL
    url: string; // Audio URL
}

interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    isMinimized: boolean;
    queue: Track[];
    
    // Actions
    play: (track?: Track) => void;
    pause: () => void;
    stop: () => void;
    next: () => void;
    prev: () => void;
    minimize: (minimized: boolean) => void;
    addToQueue: (track: Track) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    isMinimized: false,
    queue: [],

    play: (track) => {
        if (track) {
            set({ currentTrack: track, isPlaying: true });
        } else if (get().currentTrack) {
            set({ isPlaying: true });
        }
    },
    pause: () => set({ isPlaying: false }),
    stop: () => set({ isPlaying: false, currentTrack: null }),
    next: () => {
        // Mock next logic
        console.log("Next track");
    },
    prev: () => {
        console.log("Prev track");
    },
    minimize: (minimized) => set({ isMinimized: minimized }),
    addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
}));
