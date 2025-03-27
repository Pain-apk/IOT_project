export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export interface FingerData {
  extended: boolean;
  angle: number;
}

export interface HandTrackingData {
  hand_detected: boolean;
  hand_landmarks: Landmark3D[];
  wrist_position: Landmark3D;
  fingers: {
    thumb: FingerData;
    index: FingerData;
    middle: FingerData;
    ring: FingerData;
    pinky: FingerData;
  };
  gesture: string;
  tracking_quality: number;
  timestamp: number;
}
