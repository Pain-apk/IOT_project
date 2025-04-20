// Main JavaScript file for Hand Tracking Robot Arm Control
// This file is the entry point for our simplified application

// Import needed MediaPipe libraries
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js";

// Global variables
let handLandmarker = null;
let webcamRunning = false;
let lastVideoTime = -1;
let results = null;
let videoElement = null;
let canvasElement = null;
let canvasCtx = null;
let socket = null;
let isConnected = false;
let esp32IP = '';
let currentHandPosition = null;

// Constants for hand tracking
const confidenceThreshold = 0.5;
const updateFrequency = 100; // ms between updates

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    videoElement = document.getElementById('webcam');
    canvasElement = document.getElementById('output-canvas');
    canvasCtx = canvasElement.getContext('2d');
    
    // Set up event listeners
    document.getElementById('connect-btn').addEventListener('click', connectToESP32);
    document.getElementById('webcam-btn').addEventListener('click', toggleWebcam);
    
    // Initialize MediaPipe
    initializeHandLandmarker();
});

// Initialize MediaPipe HandLandmarker
async function initializeHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
        },
        numHands: 1,
        runningMode: "VIDEO",
        minHandDetectionConfidence: confidenceThreshold,
        minHandPresenceConfidence: confidenceThreshold,
        minTrackingConfidence: confidenceThreshold
    });
    
    console.log("HandLandmarker initialized successfully");
}

// Connect to ESP32 via WebSocket
function connectToESP32() {
    if (isConnected) {
        if (socket) {
            socket.close();
            socket = null;
        }
        isConnected = false;
        document.getElementById('connect-btn').textContent = 'Connect';
        document.getElementById('connection-status').textContent = 'Disconnected';
        document.getElementById('connection-status').className = 'status-indicator disconnected';
        return;
    }
    
    esp32IP = document.getElementById('ip-address').value;
    if (!esp32IP) {
        alert('Please enter the ESP32 IP address');
        return;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${esp32IP}:81`;
    
    try {
        socket = new WebSocket(wsUrl);
        
        socket.onopen = function() {
            console.log('Connected to ESP32');
            isConnected = true;
            document.getElementById('connect-btn').textContent = 'Disconnect';
            document.getElementById('connection-status').textContent = 'Connected';
            document.getElementById('connection-status').className = 'status-indicator connected';
            
            // Start sending data at regular intervals
            startSendingData();
        };
        
        socket.onclose = function() {
            console.log('Disconnected from ESP32');
            isConnected = false;
            document.getElementById('connect-btn').textContent = 'Connect';
            document.getElementById('connection-status').textContent = 'Disconnected';
            document.getElementById('connection-status').className = 'status-indicator disconnected';
        };
        
        socket.onerror = function(error) {
            console.error('WebSocket Error:', error);
            alert('Error connecting to ESP32. Make sure the IP address is correct and the ESP32 is running.');
            isConnected = false;
            document.getElementById('connect-btn').textContent = 'Connect';
            document.getElementById('connection-status').textContent = 'Error';
            document.getElementById('connection-status').className = 'status-indicator error';
        };
    } catch (error) {
        console.error('Error creating WebSocket:', error);
        alert('Error connecting to ESP32: ' + error.message);
    }
}

// Start/stop webcam
async function toggleWebcam() {
    if (webcamRunning) {
        webcamRunning = false;
        document.getElementById('webcam-btn').textContent = 'Start Webcam';
        
        // Stop webcam
        if (videoElement.srcObject) {
            const tracks = videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    } else {
        try {
            const constraints = {
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            videoElement.addEventListener('loadeddata', predictWebcam);
            webcamRunning = true;
            document.getElementById('webcam-btn').textContent = 'Stop Webcam';
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Error accessing webcam: ' + error.message);
        }
    }
}

// Process webcam frames and detect hands
async function predictWebcam() {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Check if video is playing
    if (videoElement.currentTime !== lastVideoTime) {
        lastVideoTime = videoElement.currentTime;
        results = handLandmarker.detectForVideo(videoElement, performance.now());
    }
    
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw video frame
    canvasCtx.drawImage(
        videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Process results if hands are detected
    if (results && results.landmarks && results.landmarks.length > 0) {
        // Extract hand landmarks
        const landmarks = results.landmarks[0];
        
        // Draw landmarks
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00'});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', radius: 2});
        
        // Process hand position for robot control
        processHandPosition(landmarks);
        
        // Display hand position data
        updateDataDisplay();
    } else {
        currentHandPosition = null;
        clearDataDisplay();
    }
    
    canvasCtx.restore();
    
    // Continue loop
    if (webcamRunning) {
        requestAnimationFrame(predictWebcam);
    }
}

// Process hand landmarks and convert to robot control commands
function processHandPosition(landmarks) {
    // Wrist position (landmark 0)
    const wrist = landmarks[0];
    
    // Palm center calculation (average of key points)
    const palm = {
        x: (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3,
        y: (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3,
        z: (landmarks[0].z + landmarks[5].z + landmarks[17].z) / 3
    };
    
    // Thumb tip (landmark 4)
    const thumbTip = landmarks[4];
    
    // Index finger tip (landmark 8)
    const indexTip = landmarks[8];
    
    // Calculate hand openness (distance between thumb and index finger)
    const grabDistance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) +
        Math.pow(thumbTip.y - indexTip.y, 2) +
        Math.pow(thumbTip.z - indexTip.z, 2)
    );
    
    // Determine grab state (open or closed)
    const isGrabbing = grabDistance < 0.1;
    
    // Map hand position to servo angles
    // X position (left-right) maps to base rotation (0-180)
    const baseAngle = Math.floor(wrist.x * 180);
    
    // Y position (up-down) maps to vertical movement (0-180)
    const verticalAngle = Math.floor((1 - wrist.y) * 180);
    
    // Z position (depth) maps to joint horizontal movement (0-180)
    // Normalize Z which is typically small values
    const jointAngle = Math.floor((wrist.z + 0.2) * 150);
    
    // Wrist rotation (based on hand orientation)
    // Using the angle between index finger and thumb as an approximation
    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const wristAngle = Math.floor(((Math.atan2(dy, dx) * 180 / Math.PI) + 180) / 2);
    
    // Gripper angles depend on hand openness
    const leftGripperAngle = isGrabbing ? 30 : 120;
    const rightGripperAngle = isGrabbing ? 120 : 30; // Mirrored position
    
    // Store current hand position
    currentHandPosition = {
        baseAngle: baseAngle,
        verticalAngle: verticalAngle,
        jointAngle: jointAngle,
        wristAngle: wristAngle,
        leftGripperAngle: leftGripperAngle,
        rightGripperAngle: rightGripperAngle,
        isGrabbing: isGrabbing
    };
}

// Start sending data to ESP32
function startSendingData() {
    if (socket && isConnected) {
        setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN && currentHandPosition) {
                const data = {
                    base: currentHandPosition.baseAngle,
                    vertical: currentHandPosition.verticalAngle,
                    joint: currentHandPosition.jointAngle,
                    wrist: currentHandPosition.wristAngle,
                    leftGripper: currentHandPosition.leftGripperAngle,
                    rightGripper: currentHandPosition.rightGripperAngle
                };
                
                socket.send(JSON.stringify(data));
                console.log("Sent data:", data);
            }
        }, updateFrequency);
    }
}

// Update data display
function updateDataDisplay() {
    if (!currentHandPosition) return;
    
    const dataDisplay = document.getElementById('data-display');
    dataDisplay.innerHTML = `
        <div>Base: ${currentHandPosition.baseAngle}°</div>
        <div>Vertical: ${currentHandPosition.verticalAngle}°</div>
        <div>Joint: ${currentHandPosition.jointAngle}°</div>
        <div>Wrist: ${currentHandPosition.wristAngle}°</div>
        <div>Gripper: ${currentHandPosition.isGrabbing ? "Closed" : "Open"}</div>
    `;
}

// Clear data display
function clearDataDisplay() {
    document.getElementById('data-display').innerHTML = 'No hand detected';
}

// MediaPipe drawing utilities
const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],    // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],    // Index finger
    [5, 9], [9, 10], [10, 11], [11, 12],  // Middle finger
    [9, 13], [13, 14], [14, 15], [15, 16],  // Ring finger
    [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [0, 17], [5, 9], [9, 13], [13, 17]  // Palm
];

function drawConnectors(ctx, landmarks, connections, options) {
    const color = options?.color || '#00FF00';
    const lineWidth = options?.lineWidth || 2;
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    
    for (const connection of connections) {
        const [start, end] = connection;
        if (landmarks[start] && landmarks[end]) {
            ctx.beginPath();
            ctx.moveTo(landmarks[start].x * ctx.canvas.width, landmarks[start].y * ctx.canvas.height);
            ctx.lineTo(landmarks[end].x * ctx.canvas.width, landmarks[end].y * ctx.canvas.height);
            ctx.stroke();
        }
    }
}

function drawLandmarks(ctx, landmarks, options) {
    const color = options?.color || '#FF0000';
    const radius = options?.radius || 2;
    
    ctx.fillStyle = color;
    
    for (const landmark of landmarks) {
        ctx.beginPath();
        ctx.arc(
            landmark.x * ctx.canvas.width,
            landmark.y * ctx.canvas.height,
            radius,
            0, 2 * Math.PI);
        ctx.fill();
    }
}