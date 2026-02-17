import { WS_URL } from '@/utils/constants';

type StreamingEvent = 'chat' | 'gift' | 'connected';

interface StreamingSocketMessage {
  event: StreamingEvent;
  data: any;
}

export class StreamingSocket {
  private socket: WebSocket | null = null;
  private streamId: string;
  private onMessage: (msg: StreamingSocketMessage) => void;

  constructor(streamId: string, onMessage: (msg: StreamingSocketMessage) => void) {
    this.streamId = streamId;
    this.onMessage = onMessage;
  }

  connect() {
    this.socket = new WebSocket(`${WS_URL}/streaming/ws/chat/${this.streamId}`);

    this.socket.onopen = () => {
      console.log('Connected to Streaming WebSocket');
    };

    this.socket.onmessage = (event) => {
      try {
        const message: StreamingSocketMessage = JSON.parse(event.data);
        this.onMessage(message);
      } catch (err) {
        console.error('Failed to parse Streaming socket message', err);
      }
    };

    this.socket.onclose = () => {
      console.log('Streaming WebSocket closed');
    };

    this.socket.onerror = (error) => {
      console.error('Streaming WebSocket error', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendChat(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event: 'chat', data: { message } }));
    }
  }

  sendGift(giftId: string, amount: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event: 'gift', data: { giftId, amount } }));
    }
  }
}
