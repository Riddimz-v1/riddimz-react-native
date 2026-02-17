import { create } from 'zustand';
import { karaokeService } from '../services/api/karaoke';

export type UserRole = 'host' | 'peer' | 'guest';

interface KaraokeState {
    roomId: string | null;
    participants: string[]; // User IDs (those who can stream)
    guests: string[]; // User IDs (those just watching)
    remoteStreams: Record<string, any>; // Remote MediaStreams
    currentSong: any | null; // Song object
    lyrics: any[]; // VTT cues
    userRole: UserRole;
    activeStreamId: string | 'me' | null;
    pendingRequests: string[]; // Group of User IDs requesting to join as peers
    
    // Actions
    joinRoom: (roomId: string, role?: UserRole) => Promise<void>;
    leaveRoom: () => void;
    setSong: (song: any) => void;
    addParticipant: (userId: string) => void;
    removeParticipant: (userId: string) => void;
    addGuest: (userId: string) => void;
    removeGuest: (userId: string) => void;
    addRemoteStream: (userId: string, stream: any) => void;
    removeRemoteStream: (userId: string) => void;
    addJoinRequest: (userId: string) => void;
    removeJoinRequest: (userId: string) => void;
    setActiveStream: (userId: string | 'me' | null) => void;
    setRole: (role: UserRole) => void;
}

export const useKaraokeStore = create<KaraokeState>((set) => ({
    roomId: null,
    participants: [],
    guests: [],
    remoteStreams: {},
    currentSong: null,
    lyrics: [],
    userRole: 'guest',
    activeStreamId: 'me',
    pendingRequests: [],

    joinRoom: async (roomId, role = 'guest') => {
        set({ 
            roomId, 
            userRole: role, 
            participants: role === 'host' ? ['me'] : [],
            activeStreamId: role === 'host' ? 'me' : null 
        });
    },
    leaveRoom: () => set({ 
        roomId: null, 
        participants: [], 
        guests: [],
        remoteStreams: {}, 
        currentSong: null, 
        userRole: 'guest',
        activeStreamId: null,
        pendingRequests: []
    }),
    setSong: (song) => set({ currentSong: song }),
    addParticipant: (userId) => set((state) => ({ 
        participants: state.participants.includes(userId) ? state.participants : [...state.participants, userId] 
    })),
    removeParticipant: (userId) => set((state) => ({ 
        participants: state.participants.filter(p => p !== userId) 
    })),
    addGuest: (userId) => set((state) => ({
        guests: state.guests.includes(userId) ? state.guests : [...state.guests, userId]
    })),
    removeGuest: (userId) => set((state) => ({
        guests: state.guests.filter(g => g !== userId)
    })),
    addRemoteStream: (userId, stream) => set((state) => ({
        remoteStreams: { ...state.remoteStreams, [userId]: stream },
        activeStreamId: state.activeStreamId || userId // Auto-switch if nothing is showing
    })),
    removeRemoteStream: (userId) => set((state) => {
        const { [userId]: _, ...rest } = state.remoteStreams;
        return { 
            remoteStreams: rest,
            activeStreamId: state.activeStreamId === userId ? (state.participants[0] || 'me') : state.activeStreamId
        };
    }),
    addJoinRequest: (userId) => set((state) => ({ 
        pendingRequests: state.pendingRequests.includes(userId) ? state.pendingRequests : [...state.pendingRequests, userId] 
    })),
    removeJoinRequest: (userId) => set((state) => ({ 
        pendingRequests: state.pendingRequests.filter(id => id !== userId) 
    })),
    setActiveStream: (userId) => set({ activeStreamId: userId }),
    setRole: (userRole) => set({ userRole }),
}));
