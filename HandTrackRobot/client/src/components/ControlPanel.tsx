import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Copy, Save } from "lucide-react";
import { HandTrackingData } from "@/lib/handDataTypes";
import { useToast } from "@/hooks/use-toast";

interface ControlPanelProps {
  trackingSettings: {
    showLandmarks: boolean;
    showConnections: boolean;
    mirrorView: boolean;
    sendData: boolean;
    confidenceThreshold: number;
    fps: number;
  };
  updateTrackingSettings: (settings: Partial<typeof trackingSettings>) => void;
  handData: HandTrackingData | null;
}

export default function ControlPanel({
  trackingSettings,
  updateTrackingSettings,
  handData
}: ControlPanelProps) {
  const [calibrationSettings, setCalibrationSettings] = useState({
    minRange: { x: 0, y: 0, z: 0 },
    maxRange: { x: 1, y: 1, z: 0.5 }
  });
  const { toast } = useToast();

  const handleCopyJSON = () => {
    if (handData) {
      navigator.clipboard.writeText(JSON.stringify(handData, null, 2))
        .then(() => {
          toast({
            title: "Copied to clipboard",
            description: "Hand tracking data has been copied to clipboard",
          });
        })
        .catch(err => {
          toast({
            title: "Failed to copy",
            description: "Could not copy data to clipboard",
            variant: "destructive"
          });
        });
    }
  };

  const handleSaveLog = () => {
    if (handData) {
      const dataStr = JSON.stringify(handData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportName = `hand-tracking-${new Date().toISOString().slice(0, 19)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportName);
      linkElement.click();
    }
  };

  const setMinRange = () => {
    if (handData && handData.hand_detected) {
      setCalibrationSettings(prev => ({
        ...prev,
        minRange: {
          x: handData.wrist_position.x,
          y: handData.wrist_position.y,
          z: handData.wrist_position.z
        }
      }));
      
      toast({
        title: "Min Range Set",
        description: "Minimum range calibration point saved",
      });
    }
  };

  const setMaxRange = () => {
    if (handData && handData.hand_detected) {
      setCalibrationSettings(prev => ({
        ...prev,
        maxRange: {
          x: handData.wrist_position.x,
          y: handData.wrist_position.y,
          z: handData.wrist_position.z
        }
      }));
      
      toast({
        title: "Max Range Set",
        description: "Maximum range calibration point saved",
      });
    }
  };

  const resetCalibration = () => {
    setCalibrationSettings({
      minRange: { x: 0, y: 0, z: 0 },
      maxRange: { x: 1, y: 1, z: 0.5 }
    });
    
    toast({
      title: "Calibration Reset",
      description: "Calibration settings have been reset to defaults",
    });
  };

  const saveSettings = () => {
    // Save settings to local storage or server
    localStorage.setItem('handTrackingSettings', JSON.stringify({
      trackingSettings,
      calibrationSettings
    }));
    
    toast({
      title: "Settings Saved",
      description: "Your tracking settings have been saved",
    });
  };

  return (
    <div className="lg:w-2/5 flex flex-col gap-4">
      {/* Controls Card */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-medium text-primary mb-4">Tracking Controls</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="toggle-landmarks">Show Hand Landmarks</Label>
              <Switch 
                id="toggle-landmarks"
                checked={trackingSettings.showLandmarks}
                onCheckedChange={(checked) => updateTrackingSettings({ showLandmarks: checked })}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <Label htmlFor="toggle-connections">Show Connections</Label>
              <Switch 
                id="toggle-connections"
                checked={trackingSettings.showConnections}
                onCheckedChange={(checked) => updateTrackingSettings({ showConnections: checked })}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <Label htmlFor="toggle-mirror">Mirror View</Label>
              <Switch 
                id="toggle-mirror"
                checked={trackingSettings.mirrorView}
                onCheckedChange={(checked) => updateTrackingSettings({ mirrorView: checked })}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <Label htmlFor="toggle-send-data">Send Data to Pi</Label>
              <Switch 
                id="toggle-send-data"
                checked={trackingSettings.sendData}
                onCheckedChange={(checked) => updateTrackingSettings({ sendData: checked })}
              />
            </div>

            <div className="pt-2">
              <Label className="block mb-2 text-sm">Detection Confidence Threshold</Label>
              <div className="flex items-center">
                <Slider 
                  min={0} 
                  max={100} 
                  step={1}
                  value={[trackingSettings.confidenceThreshold * 100]}
                  onValueChange={(value) => updateTrackingSettings({ confidenceThreshold: value[0] / 100 })}
                  className="flex-grow mr-2"
                />
                <span className="font-mono text-sm">{trackingSettings.confidenceThreshold.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="pt-2">
              <Label className="block mb-2 text-sm">Update Frequency (FPS)</Label>
              <div className="flex items-center">
                <Slider 
                  min={1} 
                  max={60} 
                  step={1}
                  value={[trackingSettings.fps]}
                  onValueChange={(value) => updateTrackingSettings({ fps: value[0] })}
                  className="flex-grow mr-2"
                />
                <span className="font-mono text-sm">{trackingSettings.fps}</span>
              </div>
            </div>
          </div>

          {/* Calibration Section */}
          <div className="mt-6">
            <h3 className="font-medium mb-3">Calibration</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={setMinRange} className="bg-primary text-white">Set Min Range</Button>
              <Button onClick={setMaxRange} className="bg-primary text-white">Set Max Range</Button>
              <Button onClick={resetCalibration} variant="outline">Reset Calibration</Button>
              <Button onClick={saveSettings} variant="outline">Save Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hand Position Data Card */}
      <Card className="flex-grow">
        <CardContent className="p-4">
          <h2 className="text-lg font-medium text-primary mb-4">Hand Position Data</h2>
          
          <div className="bg-gray-100 p-3 rounded font-mono text-sm overflow-auto h-48">
            <pre>
              {handData 
                ? JSON.stringify(handData, null, 2) 
                : "No hand tracking data available."}
            </pre>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Key Positions</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-100 p-2 rounded">
                <div className="text-xs text-gray-500">Wrist</div>
                <div className="font-mono">
                  {handData && handData.hand_detected 
                    ? `x: ${handData.wrist_position.x.toFixed(2)}, y: ${handData.wrist_position.y.toFixed(2)}`
                    : "N/A"}
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <div className="text-xs text-gray-500">Index Tip</div>
                <div className="font-mono">
                  {handData && handData.hand_detected && handData.fingers.index
                    ? `x: ${handData.hand_landmarks[8].x.toFixed(2)}, y: ${handData.hand_landmarks[8].y.toFixed(2)}`
                    : "N/A"}
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <div className="text-xs text-gray-500">Thumb Tip</div>
                <div className="font-mono">
                  {handData && handData.hand_detected && handData.fingers.thumb
                    ? `x: ${handData.hand_landmarks[4].x.toFixed(2)}, y: ${handData.hand_landmarks[4].y.toFixed(2)}`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button onClick={handleCopyJSON} className="bg-secondary text-white">
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
            <Button onClick={handleSaveLog} variant="outline" className="ml-2">
              <Save className="h-4 w-4 mr-2" />
              Save Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
