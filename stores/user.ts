import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
    profile: any | null;
    settings: {
        notifications: boolean;
        publicProfile: boolean;
    };
    
    updateProfile: (profile: any) => void;
    toggleNotification: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            profile: null,
            settings: {
                notifications: true,
                publicProfile: true,
            },
            
            updateProfile: (profile) => set({ profile }),
            toggleNotification: () => set((state) => ({ 
                settings: { ...state.settings, notifications: !state.settings.notifications } 
            })),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for non-secure user prefs
        }
    )
);
