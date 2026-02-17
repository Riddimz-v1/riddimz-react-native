import { WS_URL } from '@/utils/constants';

type KaraokeEvent = 'queue_update' | 'track_change' | 'user_left' | 'user_joined' | 'join_request' | 'join_approved' | 'join_rejected' | 'session_ended' | 'soundtrack_play' | 'soundtrack_pause';

interface KaraokeSocketMessage {
  event: KaraokeEvent;
  data: any;
}

export class KaraokeSocket {
  private socket: WebSocket | null = null;
  private roomId: string;
  private onMessage: (msg: KaraokeSocketMessage) => void;

  constructor(roomId: string, onMessage: (msg: KaraokeSocketMessage) => void) {
    this.roomId = roomId;
    this.onMessage = onMessage;
  }

  connect() {
    this.socket = new WebSocket(`${WS_URL}/karaoke/ws/join/${this.roomId}`);

    this.socket.onopen = () => {
      console.log('Connected to Karaoke WebSocket');
    };

    this.socket.onmessage = (event) => {
      try {
        const message: KaraokeSocketMessage = JSON.parse(event.data);
        this.onMessage(message);
      } catch (err) {
        console.error('Failed to parse Karaoke socket message', err);
      }
    };

    this.socket.onclose = () => {
      console.log('Karaoke WebSocket closed');
    };

    this.socket.onerror = (error) => {
      console.error('Karaoke WebSocket error', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(event: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }
}
