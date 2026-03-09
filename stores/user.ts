import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserResponse } from '../services/api/types';
import { userService } from '../services/api/user';

interface UserState {
    profile: UserResponse | null;
    settings: {
        notifications: boolean;
        publicProfile: boolean;
    };
    
    updateProfile: (profile: UserResponse) => void;
    fetchProfile: () => Promise<void>;
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
            fetchProfile: async () => {
                try {
                    const profile = await userService.getProfile();
                    set({ profile });
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            },
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
