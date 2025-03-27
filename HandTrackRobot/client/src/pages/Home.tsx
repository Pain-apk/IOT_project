import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VideoFeedPanel } from '@/components/VideoFeedPanel';
import { DataPanel } from '@/components/DataPanel';
import { ConfigModal } from '@/components/ConfigModal';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useConnection } from '@/hooks/useConnection';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Initialize hand tracking hook
  const {
    webcamActive,
    trackingActive,
    handPosition,
    gesture,
    trackingStats,
    visualizationMode,
    confidenceThreshold,
    outputFormat,
    videoRef,
    canvasRef,
    toggleWebcam,
    toggleTracking,
    setVisualizationMode,
    setConfidenceThreshold,
    setOutputFormat,
    captureFrame,
    getFormattedHandData,
  } = useHandTracking();
  
  // Initialize connection hook
  const {
    isConnected,
    isStreaming,
    configOpen,
    config,
    toggleStreaming,
    openConfig,
    closeConfig,
    saveConfig
  } = useConnection();
  
  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  }, []);
  
  // Safe wrapper for toggling webcam
  const handleToggleWebcam = useCallback(async () => {
    try {
      await toggleWebcam();
      setPermissionDenied(false);
    } catch (error) {
      console.error('Error toggling webcam:', error);
      setPermissionDenied(true);
    }
  }, [toggleWebcam]);
  
  // Toggle data streaming
  const handleToggleStreaming = useCallback(() => {
    toggleStreaming(getFormattedHandData);
  }, [toggleStreaming, getFormattedHandData]);
  
  // Update timestamp when hand position changes
  useEffect(() => {
    if (handPosition) {
      setLastUpdateTime(new Date().toLocaleTimeString());
    }
  }, [handPosition]);
  
  // Apply dark mode on initial load if user prefers it
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      toggleDarkMode();
    }
  }, [toggleDarkMode]);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] dark:bg-[#121212] transition-colors duration-200">
      <Header 
        isConnected={isConnected} 
        onToggleDarkMode={toggleDarkMode} 
        darkMode={darkMode} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        <VideoFeedPanel 
          videoRef={videoRef}
          canvasRef={canvasRef}
          webcamActive={webcamActive}
          trackingActive={trackingActive}
          toggleWebcam={handleToggleWebcam}
          toggleTracking={toggleTracking}
          visualizationMode={visualizationMode}
          setVisualizationMode={setVisualizationMode}
          confidenceThreshold={confidenceThreshold}
          setConfidenceThreshold={setConfidenceThreshold}
          captureFrame={captureFrame}
          permissionDenied={permissionDenied}
        />
        
        <DataPanel 
          handPosition={handPosition}
          gesture={gesture}
          trackingStats={trackingStats}
          outputFormat={outputFormat}
          setOutputFormat={setOutputFormat}
          isConnected={isConnected}
          isStreaming={isStreaming}
          onToggleStreaming={handleToggleStreaming}
          onConfigureConnection={openConfig}
          formattedOutput={getFormattedHandData()}
          webcamActive={webcamActive}
        />
      </main>
      
      <Footer lastUpdateTime={lastUpdateTime} />
      
      <ConfigModal 
        isOpen={configOpen}
        onClose={closeConfig}
        onSave={saveConfig}
        currentConfig={config}
      />
    </div>
  );
}
