import { WS_URL } from '@/utils/constants';
export type KaraokeEvent =
  | 'queue_update'| 'track_change'| 'user_left'
  | 'user_joined'
  | 'join_request'
  | 'join_approved'
  | 'join_rejected'
  | 'session_ended'
  | 'soundtrack_play'
  | 'soundtrack_pause'
  | 'chat'; 




export type KaraokeSocketMessage =
  | { event: 'queue_update'; data: any }
  | { event: 'track_change'; data: any }
  | { event: 'user_left'; data: { userId: string } }
  | { event: 'user_joined'; data: { userId: string; role: string } }
  | { event: 'join_request'; data: { userId: string } }
  | { event: 'join_approved'; data: { userId: string } }
  | { event: 'join_rejected'; data: { userId: string } }
  | { event: 'session_ended'; data: null }
  | { event: 'soundtrack_play'; data: any }
  | { event: 'soundtrack_pause'; data: any }
  | {
      event: 'chat';
      data: {
        userId: string;
        displayName?: string;
        text: string;
      };
    };


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
      console.log('🎤 Connected to Karaoke WebSocket');
    };

    this.socket.onmessage = (event) => {
      try {
        const message: KaraokeSocketMessage = JSON.parse(event.data);
        this.onMessage(message);
      } catch (err) {
        console.error('❌ Failed to parse Karaoke socket message', err);
      }
    };

    this.socket.onclose = () => {
      console.log('🔌 Karaoke WebSocket closed');
    };

    this.socket.onerror = (error) => {
      console.error('⚠️ Karaoke WebSocket error', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * 3️⃣ Type-safe sendMessage
   */
  sendMessage<T extends KaraokeEvent>(
    event: T,
    data: Extract<KaraokeSocketMessage, { event: T }>['data']
  ) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }
}