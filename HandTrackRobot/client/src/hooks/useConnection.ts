import { useState, useCallback, useEffect } from 'react';
import { webSocketConnection } from '@/lib/websocket';
import { ConnectionConfig } from '@/types';

export function useConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<ConnectionConfig>({
    raspberryPiIp: '192.168.1.100',
    portNumber: 8080,
    updateFrequency: 10,
    enableCompression: false
  });

  // Connect to WebSocket server on component mount
  useEffect(() => {
    webSocketConnection.onConnect(() => {
      setIsConnected(true);
    });

    webSocketConnection.onDisconnect(() => {
      setIsConnected(false);
      setIsStreaming(false);
    });

    webSocketConnection.onError(() => {
      setIsConnected(false);
      setIsStreaming(false);
    });

    webSocketConnection.connect().catch(console.error);

    return () => {
      webSocketConnection.disconnect();
    };
  }, []);

  // Apply new configuration
  const applyConfig = useCallback((newConfig: ConnectionConfig) => {
    setConfig(newConfig);
    webSocketConnection.setConfig(
      newConfig.raspberryPiIp,
      newConfig.portNumber,
      newConfig.updateFrequency,
      newConfig.enableCompression
    );
  }, []);

  // Toggle streaming
  const toggleStreaming = useCallback((getHandData: () => any) => {
    if (isStreaming) {
      webSocketConnection.stopStreaming();
      setIsStreaming(false);
    } else {
      webSocketConnection.startStreaming(getHandData);
      setIsStreaming(true);
    }
  }, [isStreaming]);

  // Open config modal
  const openConfig = useCallback(() => {
    setConfigOpen(true);
  }, []);

  // Close config modal
  const closeConfig = useCallback(() => {
    setConfigOpen(false);
  }, []);

  // Save config and close modal
  const saveConfig = useCallback((newConfig: ConnectionConfig) => {
    applyConfig(newConfig);
    setConfigOpen(false);
  }, [applyConfig]);

  return {
    isConnected,
    isStreaming,
    configOpen,
    config,
    toggleStreaming,
    openConfig,
    closeConfig,
    saveConfig
  };
}
