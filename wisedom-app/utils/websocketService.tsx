import { Project, Task, Milestone } from '../types/project';
import { Interaction } from '../types/interaction';

type WebSocketEvent = 
  | { type: 'projectUpdate'; data: Project }
  | { type: 'taskUpdate'; data: Task }
  | { type: 'milestoneUpdate'; data: Milestone }
  | { type: 'interactionUpdate'; data: Interaction };

type WebSocketCallback = (event: WebSocketEvent) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private connect() {
    if (typeof window === 'undefined') return;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.callbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  private reconnect() {
    if (typeof window === 'undefined') return;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public subscribe(callback: WebSocketCallback) {
    if (typeof window === 'undefined') return () => {};
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  public send(event: WebSocketEvent) {
    if (typeof window === 'undefined') return;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}

export const websocketService = WebSocketService.getInstance(); 