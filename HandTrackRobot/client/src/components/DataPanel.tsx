import { useState, useEffect } from 'react';
import { HandPosition, TrackingStats, OutputFormat } from '@/types';

interface DataPanelProps {
  handPosition: HandPosition | null;
  gesture: { name: string; confidence: number };
  trackingStats: TrackingStats;
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;
  isConnected: boolean;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onConfigureConnection: () => void;
  formattedOutput: string;
  webcamActive: boolean;
}

export function DataPanel({
  handPosition,
  gesture,
  trackingStats,
  outputFormat,
  setOutputFormat,
  isConnected,
  isStreaming,
  onToggleStreaming,
  onConfigureConnection,
  formattedOutput,
  webcamActive
}: DataPanelProps) {
  return (
    <div className="lg:w-1/3 flex flex-col gap-6">
      {/* Hand Position Data */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-[#212121] dark:text-white">Hand Position Data</h2>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Primary Hand</p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="text-sm w-20 text-[#212121] dark:text-gray-300">Palm Center:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex-grow">
                  {handPosition ? 
                    `X: ${handPosition.palmCenter.x.toFixed(2)}, Y: ${handPosition.palmCenter.y.toFixed(2)}, Z: ${handPosition.palmCenter.z.toFixed(2)}` : 
                    'X: 0.00, Y: 0.00, Z: 0.00'}
                </code>
              </div>
              <div className="flex items-center">
                <span className="text-sm w-20 text-[#212121] dark:text-gray-300">Wrist:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex-grow">
                  {handPosition ? 
                    `X: ${handPosition.wrist.x.toFixed(2)}, Y: ${handPosition.wrist.y.toFixed(2)}, Z: ${handPosition.wrist.z.toFixed(2)}` : 
                    'X: 0.00, Y: 0.00, Z: 0.00'}
                </code>
              </div>
              <div className="flex items-center">
                <span className="text-sm w-20 text-[#212121] dark:text-gray-300">Index Tip:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex-grow">
                  {handPosition ? 
                    `X: ${handPosition.indexTip.x.toFixed(2)}, Y: ${handPosition.indexTip.y.toFixed(2)}, Z: ${handPosition.indexTip.z.toFixed(2)}` : 
                    'X: 0.00, Y: 0.00, Z: 0.00'}
                </code>
              </div>
              <div className="flex items-center">
                <span className="text-sm w-20 text-[#212121] dark:text-gray-300">Thumb Tip:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex-grow">
                  {handPosition ? 
                    `X: ${handPosition.thumbTip.x.toFixed(2)}, Y: ${handPosition.thumbTip.y.toFixed(2)}, Z: ${handPosition.thumbTip.z.toFixed(2)}` : 
                    'X: 0.00, Y: 0.00, Z: 0.00'}
                </code>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Orientation (Degrees)</p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="text-sm w-20 text-[#212121] dark:text-gray-300">Pitch:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex-grow">
                  {handPosition ? `${handPosition.orientation.pitch.toFixed(2)}°` : '0.00°'}
                </code>
              </div>
              <div className="flex items-center">
                <span className="text-sm w-20 text-[#212121] dark:text-gray-300">Roll:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex-grow">
                  {handPosition ? `${handPosition.orientation.roll.toFixed(2)}°` : '0.00°'}
                </code>
              </div>
              <div className="flex items-center">
                <span className="text-sm w-20 text-[#212121] dark:text-gray-300">Yaw:</span>
                <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm flex-grow">
                  {handPosition ? `${handPosition.orientation.yaw.toFixed(2)}°` : '0.00°'}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hand Gesture Recognition */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-[#212121] dark:text-white">Gesture Recognition</h2>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#212121] dark:text-white">Current Gesture:</span>
            <span className={`px-3 py-1 rounded font-medium ${
              gesture.confidence > 0.4 
                ? 'bg-[#4CAF50] text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-[#212121] dark:text-white'
            }`}>
              {gesture.name}
            </span>
          </div>
          
          <div className="relative pt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gesture Confidence</p>
            <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <div 
                className="bg-[#4CAF50]" 
                style={{ width: `${gesture.confidence * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tracking Statistics */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-[#212121] dark:text-white">Tracking Statistics</h2>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">FPS</p>
              <p className="text-2xl font-medium font-mono text-[#212121] dark:text-white">
                {trackingStats.fps}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Detection Time</p>
              <p className="text-2xl font-medium font-mono text-[#212121] dark:text-white">
                {trackingStats.detectionTime} ms
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tracking Quality</p>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1.5 ${
                  trackingStats.quality === 'Good' 
                    ? 'bg-[#4CAF50]' 
                    : trackingStats.quality === 'Fair' 
                      ? 'bg-[#FFC107]' 
                      : 'bg-[#FF5252]'
                }`}></div>
                <p className="font-medium text-[#212121] dark:text-white">
                  {trackingStats.quality}
                </p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hands Detected</p>
              <p className="text-2xl font-medium font-mono text-[#212121] dark:text-white">
                {trackingStats.handsDetected}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Robot Arm Control Data */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-[#212121] dark:text-white">Robot Arm Data</h2>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Servo Motor Angles (0-180°)</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Base Rotation</p>
                <p className="text-sm font-medium text-[#2196F3]">
                  {handPosition ? Math.min(180, Math.max(0, Math.round(handPosition.palmCenter.x * 180))) : 0}°
                </p>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#2196F3] h-2 rounded-full" 
                  style={{ width: handPosition ? `${Math.min(100, Math.max(0, handPosition.palmCenter.x * 100))}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Vertical Movement</p>
                <p className="text-sm font-medium text-[#4CAF50]">
                  {handPosition ? Math.min(180, Math.max(0, Math.round((1 - handPosition.palmCenter.y) * 180))) : 0}°
                </p>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#4CAF50] h-2 rounded-full" 
                  style={{ width: handPosition ? `${Math.min(100, Math.max(0, (1 - handPosition.palmCenter.y) * 100))}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Joint Horizontal</p>
                <p className="text-sm font-medium text-[#FFC107]">
                  {handPosition ? Math.min(150, Math.max(30, Math.round(30 + (handPosition.palmCenter.z + 0.5) * 60))) : 30}°
                </p>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#FFC107] h-2 rounded-full" 
                  style={{ 
                    width: handPosition 
                      ? `${Math.min(100, Math.max(0, ((handPosition.palmCenter.z + 0.5) * 0.5) * 100))}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Grabber</p>
                <p className="text-sm font-medium text-[#FF5252]">
                  {gesture.name === 'Grab' ? 180 : 0}°
                </p>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#FF5252] h-2 rounded-full" 
                  style={{ width: gesture.name === 'Grab' ? '100%' : '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raspberry Pi Communication */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-md overflow-hidden transition-colors duration-200">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#212121] dark:text-white">Pi Connection</h2>
          <div className="flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-[#4CAF50]' : 'bg-[#FF5252]'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-[#4CAF50]' : 'bg-[#FF5252]'}`}></span>
            </span>
            <span className="text-sm text-[#212121] dark:text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">JSON Data Format</span>
              <select 
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className="text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono max-h-28 overflow-auto">
              {formattedOutput}
            </pre>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={onToggleStreaming}
              disabled={!webcamActive || !isConnected}
              className={`px-3 py-1.5 ${
                isStreaming 
                  ? 'bg-[#FF5252] hover:bg-red-600' 
                  : 'bg-[#2196F3] hover:bg-blue-600'
              } text-white rounded transition-colors duration-200 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
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
                {isStreaming ? (
                  <rect x="6" y="6" width="12" height="12"></rect>
                ) : (
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                )}
              </svg>
              {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
            </button>
            <button 
              onClick={onConfigureConnection}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-[#212121] dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm flex items-center"
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
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
