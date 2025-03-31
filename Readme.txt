Simple Guide to Deploying Your Project and Setting Up ESP32
1. Deploying Your Website
Frontend Setup (Your Hand Tracking Web App)
Create a deployment file

Make sure you have a vercel.json file in your frontend folder
Put this in it: {"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}
Get your code ready to upload

Open your terminal
Type cd frontend
Type npm install and wait for it to finish
Type npm run build to create the files for uploading
Backend Setup (Your Server)
Create a deployment file

Make sure you have a vercel.json file in your backend folder
Put this in it:
{
  "version": 2,
  "builds": [{"src": "server/index.js", "use": "@vercel/node"}],
  "routes": [
    {"src": "/ws", "dest": "server/index.js"},
    {"src": "/api/(.*)", "dest": "server/index.js"},
    {"src": "/(.*)", "dest": "server/index.js"}
  ]
}
Install backend dependencies

Type cd backend
Type npm install and wait for it to finish
Uploading to Vercel (Free Hosting Service)
Install Vercel's upload tool

Type npm install -g vercel in your terminal
Upload your backend

Go to your backend folder: cd backend
Type vercel and follow the simple questions it asks
Write down the website address it gives you (like https://your-backend.vercel.app)
Upload your frontend

Go to your frontend folder: cd frontend
Type vercel and follow the questions
Your website is now live!

2. Setting Up Your ESP32
Get Your Parts Ready
ESP32 board (the little computer)
PCA9685 board (controls the servo motors)
4 servo motors (these move your robot arm)
Power supply (5-6V, don't use the USB cable to power the motors)
Jumper wires (to connect everything)
USB cable (to upload code to ESP32)
Set Up Your Computer for ESP32
Download Arduino IDE

Go to https://www.arduino.cc/en/software and download it
Install it on your computer
Add ESP32 to Arduino

Open Arduino IDE
Go to File → Preferences
Add this URL to "Additional Boards Manager URLs":
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
Go to Tools → Board → Boards Manager
Search for "ESP32" and install it
Install needed libraries

Go to Sketch → Include Library → Manage Libraries
Install these one by one:
"WebSockets" by Markus Sattler
"ArduinoJson" by Benoit Blanchon
"Adafruit PWM Servo Driver Library"
Connect Your Hardware
Wire ESP32 to servo controller

ESP32 5V pin → PCA9685 VCC pin
ESP32 GND pin → PCA9685 GND pin
ESP32 pin 21 → PCA9685 SDA pin
ESP32 pin 22 → PCA9685 SCL pin
Connect servo motors to controller

Base rotation motor → Channel 0
Up/down motor → Channel 1
Forward/back motor → Channel 2
Gripper motor → Channel 3
Connect power

Connect 5-6V power supply to PCA9685 V+ and GND terminals
IMPORTANT: Don't try to power all servos directly from ESP32, they need their own power!
Upload Code to ESP32
Connect ESP32 to computer

Use USB cable to connect ESP32 to your computer
Open your ESP32 code

Open Arduino IDE
Open the esp32_robotic_arm.ino file we created
Change WiFi settings

Find these lines in the code:
const char* ssid = "Your_WiFi_Name";
const char* password = "Your_WiFi_Password";
Change them to match your home WiFi name and password
Upload code

Select your board: Tools → Board → ESP32 Dev Module
Select your port: Tools → Port → (select the COM port or /dev/ttyUSB0)
Click the upload button (right arrow icon)
Wait for "Done uploading" message
Find ESP32's IP address

Open Serial Monitor: Tools → Serial Monitor
Set speed to 115200
Look for a message like: "IP address: 192.168.1.105"
Write this IP address down! You'll need it
3. Connect Everything Together
Open your website

Go to your deployed website in a browser
Set up connection to ESP32

Click the connection settings icon
Enter the ESP32's IP address you wrote down earlier
Make sure port is set to 81
Click "Save Configuration"
Start hand tracking

Click "Start Webcam" and allow camera access
Click "Start Tracking"
You should see your hand being tracked on screen
Control the robot arm

Move your hand left/right to rotate the base
Move your hand up/down to move the arm up/down
Move your hand forward/back to extend/retract
Make a grab gesture to close the gripper, open your hand to release
Troubleshooting
If ESP32 Won't Connect to WiFi
Make sure WiFi name and password are correct
Make sure your WiFi is working
If Servos Don't Move
Check all wires are connected properly
Make sure servos have enough power
Check Serial Monitor for any error messages
If Website Can't Connect to ESP32
Make sure both are on the same WiFi network
Double-check the IP address
Make sure port 81 is correct
Try restarting the ESP32
If Hand Tracking Doesn't Work
Allow camera permissions in your browser
Make sure you have good lighting
Keep your hand in the camera view
Let me know if you need help with any specific step!