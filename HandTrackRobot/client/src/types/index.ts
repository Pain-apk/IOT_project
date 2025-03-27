export interface HandPosition {
  palmCenter: Coordinate;
  wrist: Coordinate;
  indexTip: Coordinate;
  thumbTip: Coordinate;
  orientation: Orientation;
}

export interface Coordinate {
  x: number;
  y: number;
  z: number;
}

export interface Orientation {
  pitch: number;
  roll: number;
  yaw: number;
}

export interface TrackingStats {
  fps: number;
  detectionTime: number;
  quality: 'Good' | 'Fair' | 'Poor';
  handsDetected: number;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface ConnectionConfig {
  raspberryPiIp: string;
  portNumber: number;
  updateFrequency: number;
  enableCompression: boolean;
}

export type VisualizationMode = 'landmarks' | 'skeleton' | 'boundingBox' | 'all';

export type OutputFormat = 'json' | 'csv';

export interface HandData {
  timestamp: number;
  hand: {
    palmCenter: Coordinate;
    wrist: Coordinate;
    gesture: string;
    confidence: number;
  }
}
