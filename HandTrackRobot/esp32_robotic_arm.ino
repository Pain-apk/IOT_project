//
// ESP32 Robotic Arm Controller with WebSocket Connection
// For use with Hand Tracking Robot Arm Control web application
//

#include <WiFi.h>
#include <WebSocketsServer.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <ArduinoJson.h>

// ==================== CONFIGURATION ====================
// Wi-Fi Credentials - CHANGE THESE
const char* ssid = "Your_WiFi_Name";
const char* password = "Your_WiFi_Password";

// Create access point instead of connecting to existing WiFi
// Set to true to create its own network, false to join existing network
const bool createAccessPoint = false;
const char* apName = "RobotArm-ESP32";
const char* apPassword = "robotarm123";

// WebSocket server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);

// PCA9685 Servo Driver
Adafruit_PWMServoDriver pca = Adafruit_PWMServoDriver(0x40);  // I2C address 0x40

// Servo Configuration
#define SERVOMIN  150   // Minimum pulse length
#define SERVOMAX  550   // Maximum pulse length

// Servo Channels (Adjust based on your wiring)
#define BASE_ROTATION 0     // Controls left/right movement - MG996R
#define VERTICAL_MOVEMENT 1 // Controls up/down movement - MG996R
#define JOINT_HORIZONTAL 2  // Controls forward/back movement - MG996R
#define WRIST_ROTATION 3    // Controls wrist rotation - MG996R
#define GRIPPER_LEFT 4      // Left gripper servo - Micro servo
#define GRIPPER_RIGHT 5     // Right gripper servo - Micro servo

// Servo Limits (prevent damage by limiting range)
const int servoLimits[6][2] = {
  {20, 160},  // BASE_ROTATION: min, max - MG996R
  {30, 150},  // VERTICAL_MOVEMENT: min, max - MG996R
  {40, 140},  // JOINT_HORIZONTAL: min, max - MG996R
  {20, 160},  // WRIST_ROTATION: min, max - MG996R
  {30, 120},  // GRIPPER_LEFT: min, max (30=closed, 120=open) - Micro servo
  {30, 120}   // GRIPPER_RIGHT: min, max (30=closed, 120=open) - Micro servo
};

// Servo Smoothing
const int servoSpeed = 5;       // Lower = slower movement
unsigned long lastMoveTime = 0;
int currentPositions[6] = {90, 90, 90, 90, 90, 90}; // Starting positions
int targetPositions[6] = {90, 90, 90, 90, 90, 90};  // Target positions

// ==================== UTILITY FUNCTIONS ====================
// Convert angle (0-180) to pulse width for PCA9685
int angleToPulse(int angle) {
  return map(angle, 0, 180, SERVOMIN, SERVOMAX);
}

// Constrain angle to servo limits
int constrainAngle(int servoIndex, int angle) {
  return constrain(angle, servoLimits[servoIndex][0], servoLimits[servoIndex][1]);
}

// Move servo smoothly to target position
void moveServoSmooth(int servoIndex, int targetAngle) {
  // Constrain to safe limits
  targetAngle = constrainAngle(servoIndex, targetAngle);
  
  // Update target position
  targetPositions[servoIndex] = targetAngle;
}

// Update all servo positions gradually (called in loop)
void updateServos() {
  // Only update servos at certain intervals
  unsigned long currentTime = millis();
  if (currentTime - lastMoveTime < 20) {
    return; // Not time to update yet
  }
  lastMoveTime = currentTime;
  
  bool moved = false;
  
  // Update each servo position
  for (int i = 0; i < 6; i++) {
    if (currentPositions[i] != targetPositions[i]) {
      moved = true;
      
      // Move current position towards target
      if (currentPositions[i] < targetPositions[i]) {
        currentPositions[i] += min(servoSpeed, targetPositions[i] - currentPositions[i]);
      } else {
        currentPositions[i] -= min(servoSpeed, currentPositions[i] - targetPositions[i]);
      }
      
      // Set servo position
      pca.setPWM(i, 0, angleToPulse(currentPositions[i]));
    }
  }
  
  // Send status update to clients if movement occurred
  if (moved) {
    sendStatusUpdate();
  }
}

// Send servo status to connected clients
void sendStatusUpdate() {
  StaticJsonDocument<200> doc;
  doc["base"] = currentPositions[BASE_ROTATION];
  doc["vertical"] = currentPositions[VERTICAL_MOVEMENT];
  doc["joint"] = currentPositions[JOINT_HORIZONTAL];
  doc["wrist"] = currentPositions[WRIST_ROTATION];
  doc["leftGripper"] = currentPositions[GRIPPER_LEFT];
  doc["rightGripper"] = currentPositions[GRIPPER_RIGHT];
  
  char buffer[200];
  serializeJson(doc, buffer);
  
  webSocket.broadcastTXT(buffer);
}

// ==================== WEBSOCKET HANDLING ====================
// WebSocket message handler
void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
  switch(type) {
    // Client connected
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
        
        // Send current servo positions
        sendStatusUpdate();
      }
      break;
      
    // Client disconnected
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected\n", num);
      break;
      
    // Text message received
    case WStype_TEXT:
      {
        Serial.printf("[%u] Received text: %s\n", num, payload);
        
        // Parse JSON message
        StaticJsonDocument<200> doc;
        DeserializationError error = deserializeJson(doc, payload);
        
        if (error) {
          Serial.print("deserializeJson() failed: ");
          Serial.println(error.c_str());
          return;
        }
        
        // Extract servo angles
        if (doc.containsKey("base")) {
          moveServoSmooth(BASE_ROTATION, doc["base"]);
        }
        
        if (doc.containsKey("vertical")) {
          moveServoSmooth(VERTICAL_MOVEMENT, doc["vertical"]);
        }
        
        if (doc.containsKey("joint")) {
          moveServoSmooth(JOINT_HORIZONTAL, doc["joint"]);
        }
        
        if (doc.containsKey("wrist")) {
          moveServoSmooth(WRIST_ROTATION, doc["wrist"]);
        }
        
        if (doc.containsKey("leftGripper")) {
          moveServoSmooth(GRIPPER_LEFT, doc["leftGripper"]);
        }
        
        if (doc.containsKey("rightGripper")) {
          moveServoSmooth(GRIPPER_RIGHT, doc["rightGripper"]);
        }
      }
      break;
  }
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  
  // Initialize I2C for servo controller
  Wire.begin();
  
  // Initialize PCA9685
  pca.begin();
  pca.setPWMFreq(50);  // Analog servos run at ~50 Hz
  
  // Set all servos to initial position
  for (int i = 0; i < 6; i++) {
    pca.setPWM(i, 0, angleToPulse(currentPositions[i]));
    delay(100); // Slight delay to prevent power surge
  }
  
  // Wi-Fi Connection
  if (createAccessPoint) {
    // Create access point
    WiFi.softAP(apName, apPassword);
    IPAddress IP = WiFi.softAPIP();
    Serial.print("Access Point created! IP address: ");
    Serial.println(IP);
  } else {
    // Connect to existing WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println();
      Serial.print("Connected! IP address: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println();
      Serial.println("Failed to connect to WiFi. Creating access point instead.");
      
      // If WiFi connection fails, create an access point
      WiFi.softAP(apName, apPassword);
      IPAddress IP = WiFi.softAPIP();
      Serial.print("Access Point created! IP address: ");
      Serial.println(IP);
    }
  }
  
  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket server started");
}

// ==================== MAIN LOOP ====================
void loop() {
  // Handle WebSocket events
  webSocket.loop();
  
  // Update servo positions
  updateServos();
}