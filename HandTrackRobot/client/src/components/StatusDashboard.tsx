import { HandTrackingData } from "@/lib/handDataTypes";

interface StatusDashboardProps {
  handData: HandTrackingData | null;
  trackingStats: {
    fps: number;
    quality: number;
    latency: number;
  };
}

export default function StatusDashboard({ 
  handData, 
  trackingStats 
}: StatusDashboardProps) {
  // Generate finger status indicators
  const generateFingerStatus = (handData: HandTrackingData | null) => {
    const fingers = ["thumb", "index", "middle", "ring", "pinky"];
    
    return fingers.map(finger => {
      const isExtended = handData?.hand_detected && 
                          handData.fingers && 
                          handData.fingers[finger as keyof typeof handData.fingers]?.extended;
      
      return (
        <div key={finger} className="text-center">
          <div className={`rounded-full h-3 w-3 ${isExtended ? 'bg-secondary' : 'bg-gray-300'} mx-auto`}></div>
          <div className="text-xs mt-1 capitalize">{finger}</div>
        </div>
      );
    });
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap -mx-2">
          {/* Hand Gesture */}
          <div className="w-full md:w-1/4 px-2 mb-4 md:mb-0">
            <div className="border border-gray-200 rounded p-3">
              <h3 className="text-sm font-medium mb-2">Detected Gesture</h3>
              <div className="flex items-center">
                <span className="text-2xl font-medium text-primary">
                  {handData?.hand_detected ? handData.gesture : "None"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Finger Status */}
          <div className="w-full md:w-2/4 px-2 mb-4 md:mb-0">
            <div className="border border-gray-200 rounded p-3">
              <h3 className="text-sm font-medium mb-2">Finger Status</h3>
              <div className="flex justify-between">
                {generateFingerStatus(handData)}
              </div>
            </div>
          </div>
          
          {/* Tracking Stats */}
          <div className="w-full md:w-1/4 px-2">
            <div className="border border-gray-200 rounded p-3">
              <h3 className="text-sm font-medium mb-2">Tracking Stats</h3>
              <div className="text-xs font-mono">
                <div className="flex justify-between mb-1">
                  <span>FPS:</span>
                  <span>{trackingStats.fps}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Quality:</span>
                  <span>{trackingStats.quality.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span>{trackingStats.latency}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
