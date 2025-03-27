import { useEffect, useState } from 'react';
import { VisualizationMode } from '@/types';

interface VideoFeedPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  webcamActive: boolean;
  trackingActive: boolean;
  toggleWebcam: () => void;
  toggleTracking: () => void;
  visualizationMode: VisualizationMode;
  setVisualizationMode: (mode: VisualizationMode) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (value: number) => void;
  captureFrame: () => void;
  permissionDenied?: boolean;
}

export function VideoFeedPanel({
  videoRef,
  canvasRef,
  webcamActive,
  trackingActive,
  toggleWebcam,
  toggleTracking,
  visualizationMode,
  setVisualizationMode,
  confidenceThreshold,
  setConfidenceThreshold,
  captureFrame,
  permissionDenied = false
}: VideoFeedPanelProps) {
  const [confidenceValue, setConfidenceValue] = useState(confidenceThreshold.toString());

  useEffect(() => {
    setConfidenceValue(confidenceThreshold.toString());
  }, [confidenceThreshold]);

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setConfidenceThreshold(value);
  };

  return (
    <div className="lg:w-2/3 flex flex-col">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-colors duration-200">
        {/* Video Feed Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#212121] dark:text-white">Video Feed</h2>
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleWebcam}
              className="flex items-center px-3 py-1.5 bg-[#2196F3] text-white rounded hover:bg-blue-600 transition-colors duration-200 text-sm"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-1"
              >
                <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14"></path>
                <rect width="14" height="12" x="1" y="6" rx="2" ry="2"></rect>
              </svg>
              <span>{webcamActive ? 'Stop Camera' : 'Start Camera'}</span>
            </button>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="toggleTracking" 
                className="sr-only" 
                disabled={!webcamActive}
                checked={trackingActive}
                onChange={toggleTracking}
              />
              <label htmlFor="toggleTracking" className="flex items-center cursor-pointer">
                <div className={`relative w-10 h-5 ${webcamActive ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'} rounded-full transition-colors duration-200`}>
                  <div 
                    className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 transform ${trackingActive ? 'translate-x-5 bg-[#2196F3]' : ''}`}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-[#212121] dark:text-gray-300">Tracking</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Video Container */}
        <div className="relative flex-grow bg-gray-800 flex items-center justify-center">
          {/* Camera Off Message */}
          {!webcamActive && !permissionDenied && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900 bg-opacity-90 z-10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mb-4"
              >
                <line x1="2" x2="22" y1="2" y2="22"></line>
                <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14"></path>
                <rect width="14" height="12" x="1" y="6" rx="2" ry="2"></rect>
              </svg>
              <p className="text-xl font-medium text-center">Camera is currently off</p>
              <p className="text-sm mt-2 text-center text-gray-300 px-4">Click "Start Camera" to begin hand tracking</p>
            </div>
          )}
          
          {/* Video Element */}
          <video 
            ref={videoRef} 
            className={`w-full h-full object-contain ${webcamActive ? '' : 'hidden'}`} 
            autoPlay 
            playsInline
          ></video>
          
          {/* Canvas Overlay for Hand Tracking */}
          <canvas 
            ref={canvasRef} 
            className={`absolute inset-0 w-full h-full ${trackingActive ? '' : 'hidden'}`}
          ></canvas>
          
          {/* Permission Denied Message */}
          {permissionDenied && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900 bg-opacity-90 z-10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#FF5252" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mb-4"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="8" y2="12"></line>
                <line x1="12" x2="12.01" y1="16" y2="16"></line>
              </svg>
              <p className="text-xl font-medium text-center">Camera access denied</p>
              <p className="text-sm mt-2 text-center text-gray-300 px-4">Please allow camera permissions to use this application</p>
            </div>
          )}
        </div>
        
        {/* Video Controls */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 transition-colors duration-200">
          <div className="flex items-center">
            <span className="text-sm text-[#212121] dark:text-gray-300 mr-2">Visualization:</span>
            <select 
              value={visualizationMode}
              onChange={(e) => setVisualizationMode(e.target.value as VisualizationMode)}
              disabled={!webcamActive}
              className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="landmarks">Hand Landmarks</option>
              <option value="skeleton">Skeleton</option>
              <option value="boundingBox">Bounding Box</option>
              <option value="all">All</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-[#212121] dark:text-gray-300 mr-2">Detection Confidence:</span>
            <input 
              type="range" 
              min="0.5" 
              max="0.9" 
              step="0.05" 
              value={confidenceThreshold}
              onChange={handleConfidenceChange}
              disabled={!webcamActive}
              className="w-32" 
            />
            <span className="ml-2 text-sm font-mono min-w-10 inline-block dark:text-gray-300">
              {confidenceThreshold.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center ml-auto">
            <button 
              onClick={captureFrame}
              disabled={!webcamActive}
              className="flex items-center px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-[#212121] dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-1"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
              Capture Frame
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
