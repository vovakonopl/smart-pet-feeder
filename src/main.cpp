#include <Arduino.h>

#include "iot/ble.h"
#include "iot/wifi.h"

void setup() {
  Serial.begin(9600);
  delay(500);

  bleManager.setup();
  wifiManager.init();

  Serial.println("BLE initialized");
}

void loop() {
  BleManager::loop();
  wifiManager.handleStatus();
}