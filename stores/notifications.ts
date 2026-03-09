import { create } from 'zustand';

export type NotificationType = 'join_request' | 'join_approved' | 'gift' | 'system' | 'performer_added';

export interface RealtimeNotification {
    id: string;
    type: NotificationType;
    message: string;
    details?: any;
}

interface NotificationState {
    notifications: RealtimeNotification[];
    addNotification: (type: NotificationType, message: string, details?: any) => void;
    removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (type, message, details) => {
        const id = Math.random().toString(36).substring(7);
        const newNotification = { id, type, message, details };
        
        set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 3) // Keep only last 3
        }));

        // Auto-remove after 4 seconds
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            }));
        }, 4000);
    },
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
    }))
}));
