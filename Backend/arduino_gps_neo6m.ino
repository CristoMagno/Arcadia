// Arduino R4 script for NEO-6M GPS module
// Compatible with the provided Python script

#include <TinyGPS++.h>
#include <SPI.h>
#include "Arduino_LED_Matrix.h"

// Optional: Include these libraries if you want to add temperature and humidity sensors
// #include <DHT.h>
// #define DHTPIN 2     // Digital pin connected to the DHT sensor
// #define DHTTYPE DHT22   // DHT 22 (AM2302) or DHT11 depending on your sensor
// DHT dht(DHTPIN, DHTTYPE);

// Create a TinyGPS++ object
TinyGPSPlus gps;

// For Arduino R4 LED Matrix
ArduinoLEDMatrix matrix;

// Connections for NEO-6M GPS module:
// GPS TX -> Arduino RX (pin 0 for Serial1 on Arduino R4)
// GPS RX -> Arduino TX (pin 1 for Serial1 on Arduino R4)
// GPS VCC -> Arduino 5V
// GPS GND -> Arduino GND

// Define the serial port for the GPS module
#define GPSSerial Serial1

// Variables to hold GPS data
float latitude = 0.0;
float longitude = 0.0;
float humidity = 50.0;  // Default values if no sensor connected
float temperature = 25.0;  // Default values if no sensor connected

// LED patterns for status indication - uses the correct format for Arduino R4 LED Matrix
// Each uint32_t represents one row of 8 LEDs
const uint32_t gps_fixed[3] = {
  0x71041,
	0x7101107,
	0x10000000
};

const uint32_t gps_searching[3] = {
  0x44e64,
		0xa74a5ca4,
		0xca44e000
};

void setup() {
  // Initialize the LED matrix
  matrix.begin();
  matrix.loadFrame(gps_searching);
  
  // Initialize serial communication with the computer
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for Serial port to connect
  }
  
  // Initialize the GPS module serial port
  GPSSerial.begin(9600);
  
  // Initialize DHT sensor if connected
  // dht.begin();
  
  Serial.println("GPS Module Initialized. Waiting for fix...");
}

void loop() {
  // Read data from the GPS module
  while (GPSSerial.available() > 0) {
    if (gps.encode(GPSSerial.read())) {
      // If we have new valid data
      if (gps.location.isUpdated() && gps.location.isValid()) {
        // Update the display to show a fix
        matrix.loadFrame(gps_fixed);
        
        // Read current location data
        latitude = gps.location.lat();
        longitude = gps.location.lng();
        
        // Read humidity and temperature (if DHT sensor is connected)
        // If you have a DHT sensor, uncomment these lines
        // humidity = dht.readHumidity();
        // temperature = dht.readTemperature();
        
        // Send data in the format expected by the Python script
        Serial.print("GPS_DATA: ");
        Serial.print(latitude, 6);  // 6 decimal places for accuracy
        Serial.print(",");
        Serial.print(longitude, 6);
        Serial.print(",");
        Serial.print(humidity);
        Serial.print(",");
        Serial.println(temperature);
      }
    }
  }
  
  // Check if the GPS data is getting too old (no fix for a long time)
  if (millis() > 5000 && gps.charsProcessed() < 10) {
    Serial.println("No GPS detected. Check wiring.");
    delay(5000);
  }
  
  // Send data every few seconds to not overwhelm the serial connection
  delay(2000);
}