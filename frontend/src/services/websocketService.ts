import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, Function[]> = new Map();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(process.env.REACT_APP_API_URL || '/api', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Listen for events
    this.socket.on('new-message', (data) => {
      this.emitEvent('new-message', data);
    });

    this.socket.on('milestone-update', (data) => {
      this.emitEvent('milestone-update', data);
    });

    this.socket.on('po-status-change', (data) => {
      this.emitEvent('po-status-change', data);
    });

    this.socket.on('document-uploaded', (data) => {
      this.emitEvent('document-uploaded', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinPO(poId: string) {
    this.socket?.emit('join-po', { poId });
  }

  leavePO(poId: string) {
    this.socket?.emit('leave-po', { poId });
  }

  sendMessage(poId: string, message: { content: string; attachments?: any[] }) {
    this.socket?.emit('send-message', { poId, message });
  }

  onEvent(event: string, callback: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(callback);
  }

  offEvent(event: string, callback: Function) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) handlers.splice(index, 1);
    }
  }

  private emitEvent(event: string, data: any) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
