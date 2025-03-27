import { Camera } from "@mediapipe/camera_utils";
import { 
  Hands, 
  HAND_CONNECTIONS, 
  Results as HandsResults, 
  VERSION as HANDS_VERSION 
} from "@mediapipe/hands";
import { HandLandmark, HandPosition, TrackingStats, VisualizationMode } from "@/types";

// Initialize MediaPipe Hands
export function initializeHandTracking(
  videoElement: HTMLVideoElement,
  onResults: (results: HandsResults) => void,
  confidenceThreshold: number = 0.7
): { hands: Hands; camera: Camera } {
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${HANDS_VERSION}/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: confidenceThreshold,
    minTrackingConfidence: 0.5
  });

  hands.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });

  return { hands, camera };
}

// Draw hand landmarks on canvas
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  results: HandsResults,
  mode: VisualizationMode = 'all'
): void {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  const landmarks = results.multiHandLandmarks[0];
  
  if (mode === 'all' || mode === 'landmarks' || mode === 'skeleton') {
    // Draw landmarks
    if (mode === 'all' || mode === 'landmarks') {
      ctx.fillStyle = '#FF4081'; // Accent color
      landmarks.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Draw connections (skeleton)
    if (mode === 'all' || mode === 'skeleton') {
      ctx.strokeStyle = '#2196F3'; // Primary color
      ctx.lineWidth = 2;
      
      HAND_CONNECTIONS.forEach(([i, j]) => {
        const from = landmarks[i];
        const to = landmarks[j];
        
        ctx.beginPath();
        ctx.moveTo(from.x * width, from.y * height);
        ctx.lineTo(to.x * width, to.y * height);
        ctx.stroke();
      });
    }
  }
  
  // Draw bounding box
  if (mode === 'all' || mode === 'boundingBox') {
    // Calculate bounding box
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    landmarks.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    // Add some padding
    const padding = 0.05;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(1, maxX + padding);
    maxY = Math.min(1, maxY + padding);
    
    // Draw bounding box
    ctx.strokeStyle = '#4CAF50'; // Secondary color
    ctx.lineWidth = 2;
    ctx.strokeRect(
      minX * width,
      minY * height,
      (maxX - minX) * width,
      (maxY - minY) * height
    );
  }
}

// Extract hand position data from results
export function extractHandPosition(results: HandsResults): HandPosition | null {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return null;
  }
  
  const landmarks = results.multiHandLandmarks[0];
  
  // MediaPipe Hand landmarks indices
  const WRIST = 0;
  const PALM_CENTER = 9; // Using middle finger MCP as approximate palm center
  const INDEX_TIP = 8;
  const THUMB_TIP = 4;
  
  // Extract key points
  const palmCenter = landmarks[PALM_CENTER];
  const wrist = landmarks[WRIST];
  const indexTip = landmarks[INDEX_TIP];
  const thumbTip = landmarks[THUMB_TIP];
  
  // Calculate orientation (simplified approximation)
  // In a real application, we'd use proper 3D math for accurate orientation
  const dx = palmCenter.x - wrist.x;
  const dy = palmCenter.y - wrist.y;
  const dz = palmCenter.z - wrist.z;
  
  const pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * (180 / Math.PI);
  const yaw = Math.atan2(dx, dz) * (180 / Math.PI);
  const roll = Math.atan2(
    indexTip.x - thumbTip.x,
    indexTip.y - thumbTip.y
  ) * (180 / Math.PI);
  
  return {
    palmCenter: {
      x: parseFloat(palmCenter.x.toFixed(2)),
      y: parseFloat(palmCenter.y.toFixed(2)),
      z: parseFloat(palmCenter.z.toFixed(2))
    },
    wrist: {
      x: parseFloat(wrist.x.toFixed(2)),
      y: parseFloat(wrist.y.toFixed(2)),
      z: parseFloat(wrist.z.toFixed(2))
    },
    indexTip: {
      x: parseFloat(indexTip.x.toFixed(2)),
      y: parseFloat(indexTip.y.toFixed(2)),
      z: parseFloat(indexTip.z.toFixed(2))
    },
    thumbTip: {
      x: parseFloat(thumbTip.x.toFixed(2)),
      y: parseFloat(thumbTip.y.toFixed(2)),
      z: parseFloat(thumbTip.z.toFixed(2))
    },
    orientation: {
      pitch: parseFloat(pitch.toFixed(2)),
      roll: parseFloat(roll.toFixed(2)),
      yaw: parseFloat(yaw.toFixed(2))
    }
  };
}

// Detect grabber-specific gestures for robotic arm control
export function detectGesture(landmarks: HandLandmark[]): { name: string; confidence: number } {
  if (!landmarks || landmarks.length === 0) {
    return { name: 'None Detected', confidence: 0 };
  }
  
  // Key points for grab detection
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const wrist = landmarks[0];
  const palmBase = landmarks[9]; // Middle finger MCP joint (palm center)
  
  // Distance between thumb and index fingertips
  const thumbIndexDistance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) + 
    Math.pow(thumbTip.y - indexTip.y, 2)
  );
  
  // Calculate the average y-position of palm
  const palmY = (landmarks[0].y + landmarks[5].y + landmarks[9].y) / 3;
  
  // Grab motion - fingers are close together (closed hand/fist)
  if (thumbIndexDistance < 0.1) {
    return { name: 'Grab', confidence: 0.9 };
  }
  
  // Open hand - fingers are spread out
  if (thumbIndexDistance > 0.15) {
    return { name: 'Release', confidence: 0.9 };
  }
  
  // Default - intermediate state
  return { name: 'Neutral', confidence: 0.5 };
}

// Format hand data for output specifically for Raspberry Pi robotic arm
export function formatHandDataForOutput(
  handPosition: HandPosition | null, 
  gesture: { name: string; confidence: number } | null,
  format: 'json' | 'csv'
): string {
  if (!handPosition || !gesture) {
    return format === 'json' 
      ? JSON.stringify({ error: 'No hand detected' }, null, 2)
      : 'error,No hand detected';
  }
  
  const timestamp = Date.now();
  
  // Map hand position to servo angles (0-180 degrees)
  // These mappings can be adjusted based on your specific robotic arm setup
  
  // Base rotation: map hand x position (0-1) to angle (0-180)
  const baseRotation = Math.min(180, Math.max(0, Math.round(handPosition.palmCenter.x * 180)));
  
  // Vertical movement: map hand y position (0-1) to angle (0-180)
  // Invert Y since screen coordinates increase downward
  const verticalMovement = Math.min(180, Math.max(0, Math.round((1 - handPosition.palmCenter.y) * 180)));
  
  // Joint horizontal: map hand z position to angle (30-150)
  // Normalize z which is typically in smaller range
  const zNormalized = (handPosition.palmCenter.z + 0.5) * 0.5; // Adjust based on typical values
  const jointHorizontal = Math.min(150, Math.max(30, Math.round(30 + zNormalized * 120)));
  
  // Grabber: 0 (open) or 180 (closed) based on gesture
  const grabberAngle = gesture.name === 'Grab' ? 180 : 0;
  
  if (format === 'json') {
    // Format specifically for the Raspberry Pi code
    const data = {
      base_rotation: baseRotation,
      vertical_movement: verticalMovement,
      joint_horizontal: jointHorizontal,
      grabber: grabberAngle
    };
    
    return JSON.stringify(data, null, 2);
  } else {
    // CSV format
    return [
      `timestamp,${timestamp}`,
      `base_rotation,${baseRotation}`,
      `vertical_movement,${verticalMovement}`,
      `joint_horizontal,${jointHorizontal}`,
      `grabber,${grabberAngle}`,
      `raw_hand_pos,${handPosition.palmCenter.x},${handPosition.palmCenter.y},${handPosition.palmCenter.z}`,
      `gesture,${gesture.name},${gesture.confidence}`
    ].join('\n');
  }
}
