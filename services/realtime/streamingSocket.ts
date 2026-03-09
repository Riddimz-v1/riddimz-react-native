import { WS_URL } from '@/utils/constants';
import { storage } from '@/utils/storage';

export type StreamingEvent = 'chat' | 'gift' | 'connected';

export type StreamingSocketMessage =
  | {
      event: 'chat';
      data: {
        message: string;
        senderId?: string;
        displayName?: string;
      };
    }
  | {
      event: 'gift';
      data: {
        giftId: string;
        amount: number;
        senderId?: string;
        displayName?: string;
      };
    }
  | {
      event: 'connected';
      data: {
        userId: string;
        displayName?: string;
      };
    };

export class StreamingSocket {
  private socket: WebSocket | null = null;
  private streamId: string;
  private onMessage: (msg: StreamingSocketMessage) => void;

  constructor(streamId: string, onMessage: (msg: StreamingSocketMessage) => void) {
    this.streamId = streamId;
    this.onMessage = onMessage;
  }

  async connect() {
    if (!this.streamId) {
      console.error('❌ Cannot connect to Streaming WebSocket: streamId is missing');
      return;
    }

    const token = await storage.getItem('auth_token');
    // Using the path specified in API_DOCUMENTATION: /streaming/ws/chat/{stream_id}
    const url = `${WS_URL}/streaming/ws/chat/${this.streamId}${token ? `?token=${token}` : ''}`;
    
    console.log(`📡 Connecting to Streaming WebSocket: ${url}`);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('📽️ Connected to Streaming WebSocket successfully');
    };

    this.socket.onmessage = (event) => {
      try {
        const message: StreamingSocketMessage = JSON.parse(event.data);
        this.onMessage(message);
      } catch (err) {
        console.error('Failed to parse Streaming socket message', err);
      }
    };

    this.socket.onclose = (event) => {
      console.log('Streaming WebSocket closed. Code:', event.code, 'Reason:', event.reason);
    };

    this.socket.onerror = (error) => {
      console.error('Streaming WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendChat(message: string) {
    this.sendMessage('chat', { message });
  }

  sendGift(giftId: string, amount: number) {
    this.sendMessage('gift', { giftId, amount });
  }

  private sendMessage<T extends StreamingEvent>(
    event: T,
    data: Extract<StreamingSocketMessage, { event: T }>['data']
  ) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }
}
