import { useEffect } from 'react';
import { peerManager } from '@/services/realtime/peerManager';

export function usePeerConnection(userId: string, localStream?: MediaStream) {
    useEffect(() => {
        if (userId) {
            peerManager.initialize(userId, localStream);
        }

        return () => {
            peerManager.destroy();
        };
    }, [userId, localStream]);

    return {
        connectToPeer: (peerId: string) => peerManager.callPeer(peerId),
    };
}
