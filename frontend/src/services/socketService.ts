import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.REACT_APP_API_URL || '/api', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinPO(poId: string) {
    this.socket?.emit('join-po', poId);
  }

  leavePO(poId: string) {
    this.socket?.emit('leave-po', poId);
  }

  sendMessage(poId: string, message: any) {
    this.socket?.emit('send-message', { poId, message });
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new-message', callback);
  }

  onMilestoneUpdate(callback: (update: any) => void) {
    this.socket?.on('milestone-update', callback);
  }

  onPOStatusChange(callback: (data: any) => void) {
    this.socket?.on('po-status-change', callback);
  }

  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();