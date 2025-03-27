import { HandPosition } from "@/types";

export class WebSocketConnection {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private onConnectCb: () => void = () => {};
  private onDisconnectCb: () => void = () => {};
  private onErrorCb: (error: Event) => void = () => {};
  private ipAddress: string = '127.0.0.1';
  private port: number = 8080;
  private updateFrequency: number = 10;
  private compressionEnabled: boolean = false;
  private streamInterval: ReturnType<typeof setInterval> | null = null;
  private lastHandData: HandPosition | null = null;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.sendHandData = this.sendHandData.bind(this);
  }

  public setConfig(
    ipAddress: string, 
    port: number, 
    updateFrequency: number, 
    compressionEnabled: boolean
  ): void {
    this.ipAddress = ipAddress;
    this.port = port;
    this.updateFrequency = updateFrequency;
    this.compressionEnabled = compressionEnabled;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let wsUrl;
        
        // Check if we're connecting to our own server or external Raspberry Pi
        if (this.ipAddress === '127.0.0.1' || this.ipAddress === 'localhost') {
          // Default to our own websocket server
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          wsUrl = `${protocol}//${window.location.host}/ws`;
        } else {
          // Direct to Raspberry Pi IP address and port
          wsUrl = `ws://${this.ipAddress}:${this.port}`;
        }
        
        console.log(`Connecting to WebSocket at ${wsUrl}`);
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log(`WebSocket connection established to ${wsUrl}`);
          this.isConnected = true;
          this.onConnectCb();
          resolve();
        };

        this.socket.onclose = () => {
          console.log(`WebSocket connection closed to ${wsUrl}`);
          this.isConnected = false;
          this.onDisconnectCb();
          this.scheduleReconnect();
        };

        this.socket.onerror = (error) => {
          console.error(`WebSocket error connecting to ${wsUrl}:`, error);
          this.onErrorCb(error);
          if (!this.isConnected) {
            reject(error);
          }
        };
      } catch (error) {
        console.error('Error in WebSocket connection:', error);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    
    this.isConnected = false;
  }

  private reconnect(): void {
    this.disconnect();
    this.connect().catch(() => {
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = setTimeout(this.reconnect, 3000);
    }
  }

  public onConnect(callback: () => void): void {
    this.onConnectCb = callback;
  }

  public onDisconnect(callback: () => void): void {
    this.onDisconnectCb = callback;
  }

  public onError(callback: (error: Event) => void): void {
    this.onErrorCb = callback;
  }

  public sendHandData(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        // Make sure data is in the correct format for the Raspberry Pi
        // It expects: { base_rotation, vertical_movement, joint_horizontal, grabber }
        let messageData = data;
        
        // If data contains a 'hand' property, it's our internal format and needs conversion
        if (data && data.hand) {
          // Extract hand position and map to servo angles
          const handPosition = data.hand;
          const gesture = handPosition.gesture || 'Release';
          
          // Convert to the format the Raspberry Pi expects
          messageData = {
            base_rotation: Math.min(180, Math.max(0, Math.round(handPosition.palmCenter.x * 180))),
            vertical_movement: Math.min(180, Math.max(0, Math.round((1 - handPosition.palmCenter.y) * 180))),
            joint_horizontal: Math.min(150, Math.max(30, Math.round(30 + (handPosition.palmCenter.z + 0.5) * 60))),
            grabber: gesture === 'Grab' ? 180 : 0
          };
        }
        
        const message = this.compressionEnabled 
          ? this.compressData(messageData)
          : JSON.stringify(messageData);
        
        this.socket.send(message);
        console.log('Sent data to robot arm:', messageData);
      } catch (error) {
        console.error('Error sending data:', error);
      }
    }
  }

  public startStreaming(getHandData: () => any): void {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
    }

    const intervalMs = 1000 / this.updateFrequency;
    
    this.streamInterval = setInterval(() => {
      const data = getHandData();
      if (data) {
        this.sendHandData(data);
      }
    }, intervalMs);
  }

  public stopStreaming(): void {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
  }

  private compressData(data: any): string {
    // Simple compression - in a real app, you'd use a proper compression library
    // This is just removing whitespace from JSON
    return JSON.stringify(data);
  }

  public isConnectionActive(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }
}

export const webSocketConnection = new WebSocketConnection();
