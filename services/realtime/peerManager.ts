import Peer from 'peerjs';

class PeerManager {
    peer: Peer | null = null;
    localStream: MediaStream | null = null;
    onStream: ((userId: string, stream: MediaStream) => void) | null = null;
    
    initialize(userId: string, localStream: MediaStream) {
        if (this.peer) return;
        this.localStream = localStream;

        this.peer = new Peer(userId, {
            host: 'peerjs.riddimz.app', // Custom peer server
            port: 443,
            secure: true,
        });

        this.peer.on('open', (id) => {
            console.log('[PeerManager] My peer ID is: ' + id);
        });

        this.peer.on('call', (call) => {
            console.log('[PeerManager] Receiving call from:', call.peer);
            call.answer(this.localStream!); 
            call.on('stream', (remoteStream) => {
                if (this.onStream) this.onStream(call.peer, remoteStream);
            });
        });
    }

    callPeer(peerId: string) {
        if (!this.peer || !this.localStream) return;
        console.log('[PeerManager] Calling peer:', peerId);
        const call = this.peer.call(peerId, this.localStream);
        call.on('stream', (remoteStream) => {
            if (this.onStream) this.onStream(peerId, remoteStream);
        });
    }

    destroy() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
            this.localStream = null;
            this.onStream = null;
        }
    }
}

export const peerManager = new PeerManager();
