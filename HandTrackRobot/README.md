# Hand Tracking Robot Arm Control

A simple web application that allows you to control an ESP32-based robot arm using hand movements captured via your webcam. The system uses MediaPipe for hand tracking and WebSockets for communication with the ESP32.

## Features

- Real-time hand tracking with MediaPipe
- WebSocket communication with ESP32
- Controls a 6-servo robot arm (base, vertical, horizontal joint, wrist rotation, dual grippers)
- Live visualization of hand tracking
- Simple, intuitive interface
- Standalone application (no server required)
- Fallback to Access Point mode if WiFi connection fails

## Hardware Requirements

- ESP32 development board
- PCA9685 16-channel PWM servo driver
- 6 servo motors:
  - 4x MG996R servo motors for the arm:
    - 1x for base rotation (left/right)
    - 1x for vertical movement (up/down)
    - 1x for joint horizontal movement (forward/back)
    - 1x for wrist rotation
  - 2x micro servo motors for the gripper:
    - 1x for left gripper
    - 1x for right gripper
- 5V power supply for servos (capable of at least 3A)
- Jumper wires
- Robot arm mechanical assembly

## Wiring

Connect the ESP32 to the PCA9685 servo driver:

1. ESP32 GPIO21 (SDA) → PCA9685 SDA
2. ESP32 GPIO22 (SCL) → PCA9685 SCL
3. ESP32 VIN → PCA9685 VCC (Power ESP32 from the driver)
4. ESP32 GND → PCA9685 GND

Connect the servos to the PCA9685:

1. Base Rotation Servo (MG996R) → Channel 0
2. Vertical Movement Servo (MG996R) → Channel 1
3. Joint Horizontal Servo (MG996R) → Channel 2
4. Wrist Rotation Servo (MG996R) → Channel 3
5. Left Gripper Servo (Micro) → Channel 4
6. Right Gripper Servo (Micro) → Channel 5

Connect external 5V power supply:
- 5V power supply (+) → PCA9685 V+
- 5V power supply (-) → PCA9685 GND

## Circuit Diagram

```
                         +-------+
                         |       |
+------------+           | PCA   |            +---------------+
|            |    SDA    | 9685  |    PWM     | 4x MG996R     |
|   ESP32    |---------->|       |----------->| Servo Motors  |
|            |    SCL    | Servo |            | (Channels 0-3)|
|            |---------->| Driver|            +---------------+
+------------+           |       |
     ^  |                |       |            +---------------+
     |  |                |       |    PWM     | 2x Micro      |
     |  |                |       |----------->| Servo Motors  |
     |  |                |       |            | (Channels 4-5)|
     |  |                +-------+            +---------------+
     |  |                 |     |                        
     |  |                 |     |                        
     |  |                 |     |                        
     |  |             +---+-----+---+                   
     |  |             |             |                   
     |  |             |    5V       |                   
     |  +------------>|    Power    |                   
     |      VCC       |    Supply   |                   
     +----------------+             |                   
           GND        |             |                   
                      +-------------+                   
```

**Notes:**
- The ESP32 connects to the PCA9685 via I2C (SDA to GPIO21, SCL to GPIO22)
- The ESP32 is powered by the PCA9685 driver VCC (which gets power from the 5V supply)
- The PCA9685 drives 6 servo motors (4 MG996R and 2 micro servos)
- The 5V power supply should be capable of providing at least 3A for all servos
- The ESP32 and PCA9685 share a common ground connection

## Software Setup

### ESP32 Setup

1. Install the required libraries in Arduino IDE:
   - WebSocketsServer by Markus Sattler
   - Adafruit PWM Servo Driver Library
   - ArduinoJson (version 6 or later)

2. Open `esp32_robotic_arm.ino` in Arduino IDE

3. Edit the WiFi settings in the code:
```
                         +-------+
                         |       |
+------------+           | PCA   |            +---------------+
|            |    SDA    | 9685  |    PWM     | 4x MG996R     |
|   ESP32    |---------->|       |----------->| Servo Motors  |
|            |    SCL    | Servo |            | (Channels 0-3)|
|            |---------->| Driver|            +---------------+
+------------+           |       |
     ^  |                |       |            +---------------+
     |  |                |       |    PWM     | 2x Micro      |
     |  |                |       |----------->| Servo Motors  |
     |  |                |       |            | (Channels 4-5)|
     |  |                +-------+            +---------------+
     |  |                 |     |                        
     |  |                 |     |                        
     |  |                 |     |                        
     |  |             +---+-----+---+                   
     |  |             |             |                   
     |  |             |    5V       |                   
     |  +------------>|    Power    |                   
     |      VCC       |    Supply   |                   
     +----------------+             |                   
           GND        |             |                   
                      +-------------+                   
```

4. Adjust servo settings if needed:
   - Check `SERVOMIN` and `SERVOMAX` values
   - Adjust servo limits in `servoLimits` array
   - Modify `servoSpeed` value to change movement speed

5. Upload the code to your ESP32

6. Open Serial Monitor (115200 baud) to view the ESP32's IP address

### Web Application Setup

The web application is a standalone HTML file that can be opened directly in a browser:

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge recommended)
2. Allow camera access when prompted
3. Enter the ESP32's IP address (from Serial Monitor) in the input field
4. Click "Connect" to establish a WebSocket connection
5. Click "Start Webcam" to begin hand tracking
6. Use your hand to control the robot arm:
   - Hand left/right position controls base rotation
   - Hand up/down position controls vertical movement
   - Hand forward/back position controls joint movement
   - Angle between thumb and index finger controls wrist rotation
   - Hand open/closed controls dual grippers (pinching motion)

## Troubleshooting

### Web Application Issues

- **Camera not working**: Make sure you've allowed camera access in your browser
- **Connection fails**: Check that the ESP32 IP address is correct and that you're on the same network
- **Tracking issues**: Ensure good lighting and a clear background for better hand detection

### ESP32 Issues

- **WiFi connection fails**: The ESP32 will automatically create an access point "RobotArm-ESP32" with password "robotarm123"
- **Servo jittering**: Check power supply capacity and adjust `servoSpeed` to a lower value
- **Unexpected movements**: Verify servo connections and adjust servo limits as needed

## Customization

You can customize various aspects of the application:

### Web Application

- Modify the styling in the `<style>` section of `index.html`
- Adjust tracking parameters in the `initializeHandLandmarker()` function in `main.js`
- Change how hand positions map to servo angles in the `processHandPosition()` function in `main.js`

### ESP32 Code

- Change the access point name and password
- Adjust servo limits and speed
- Modify the servo update frequency
- Implement additional safety features or validation

## License

This project is provided as open source. Feel free to modify and use it for personal and educational projects.

## Credits

This project uses:
- MediaPipe for hand tracking
- PCA9685 libraries by Adafruit
- WebSocketsServer library by Markus Sattler