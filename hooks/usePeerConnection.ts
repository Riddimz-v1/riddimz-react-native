import { useEffect } from 'react';
import { peerManager } from '@/services/realtime/peerManager';

export function usePeerConnection(userId: string) {
    useEffect(() => {
        if (userId) {
            peerManager.initialize(userId);
        }

        return () => {
            peerManager.destroy();
        };
    }, [userId]);

    return {
        connectToPeer: (peerId: string) => peerManager.connectToPeer(peerId),
    };
}
