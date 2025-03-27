import { useState, useEffect, useRef, useCallback } from 'react';
import { Results as HandsResults } from '@mediapipe/hands';
import { 
  initializeHandTracking, 
  drawHandLandmarks, 
  extractHandPosition, 
  detectGesture, 
  formatHandDataForOutput 
} from '@/lib/handTracking';
import { HandPosition, TrackingStats, VisualizationMode, OutputFormat } from '@/types';

export function useHandTracking() {
  const [webcamActive, setWebcamActive] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);
  const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
  const [gesture, setGesture] = useState<{ name: string; confidence: number }>({ 
    name: 'None Detected', 
    confidence: 0 
  });
  const [trackingStats, setTrackingStats] = useState<TrackingStats>({
    fps: 0,
    detectionTime: 0,
    quality: 'Good',
    handsDetected: 0
  });
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Initialize FPS counter
  useEffect(() => {
    fpsIntervalRef.current = setInterval(() => {
      setTrackingStats(prev => ({
        ...prev,
        fps: frameCountRef.current
      }));
      frameCountRef.current = 0;
    }, 1000);
    
    return () => {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
      }
    };
  }, []);
  
  // MediaPipe results handler
  const onResults = useCallback((results: HandsResults) => {
    frameCountRef.current++;
    
    // Calculate detection time
    const now = performance.now();
    const detectionTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    // Draw the hand landmarks on the canvas
    if (canvasRef.current && trackingActive) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        drawHandLandmarks(ctx, results, visualizationMode);
      }
    }
    
    // Extract hand position data
    const position = extractHandPosition(results);
    setHandPosition(position);
    
    // Detect gesture if hand is present
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const detectedGesture = detectGesture(results.multiHandLandmarks[0]);
      setGesture(detectedGesture);
      
      // Update tracking stats
      setTrackingStats(prev => ({
        ...prev,
        detectionTime: Math.round(detectionTime),
        quality: detectionTime > 20 ? 'Fair' : 'Good',
        handsDetected: results.multiHandLandmarks.length
      }));
    } else {
      setGesture({ name: 'None Detected', confidence: 0 });
      setTrackingStats(prev => ({
        ...prev,
        detectionTime: Math.round(detectionTime),
        quality: 'Good',
        handsDetected: 0
      }));
    }
  }, [trackingActive, visualizationMode]);
  
  // Toggle webcam function
  const toggleWebcam = useCallback(async () => {
    if (webcamActive) {
      // Stop webcam
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      setWebcamActive(false);
      setTrackingActive(false);
    } else {
      try {
        // Request camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Initialize MediaPipe Hands when video is ready
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              const { hands, camera } = initializeHandTracking(
                videoRef.current,
                onResults,
                confidenceThreshold
              );
              
              handsRef.current = hands;
              cameraRef.current = camera;
              
              // Start the camera
              camera.start();
              setWebcamActive(true);
            }
          };
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    }
  }, [webcamActive, confidenceThreshold, onResults]);
  
  // Toggle tracking function
  const toggleTracking = useCallback(() => {
    if (!webcamActive) return;
    setTrackingActive(prev => !prev);
  }, [webcamActive]);
  
  // Update confidence threshold
  useEffect(() => {
    if (handsRef.current) {
      handsRef.current.setOptions({
        minDetectionConfidence: confidenceThreshold
      });
    }
  }, [confidenceThreshold]);
  
  // Resize canvas to match video dimensions
  useEffect(() => {
    const resizeCanvas = () => {
      if (videoRef.current && canvasRef.current && webcamActive) {
        const { videoWidth, videoHeight } = videoRef.current;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    
    // Initial resize
    if (webcamActive) {
      resizeCanvas();
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [webcamActive]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Capture current frame as image
  const captureFrame = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || !webcamActive) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw video frame
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Draw tracking overlay if active
      if (trackingActive && canvasRef.current) {
        ctx.drawImage(canvasRef.current, 0, 0);
      }
      
      // Convert to data URL and trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `hand-tracking-${new Date().toISOString()}.png`;
      a.click();
    }
  }, [webcamActive, trackingActive]);
  
  // Format hand data for output
  const getFormattedHandData = useCallback(() => {
    return formatHandDataForOutput(handPosition, gesture, outputFormat);
  }, [handPosition, gesture, outputFormat]);
  
  return {
    // State and refs
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
    
    // Actions
    toggleWebcam,
    toggleTracking,
    setVisualizationMode,
    setConfidenceThreshold,
    setOutputFormat,
    captureFrame,
    getFormattedHandData,
  };
}
