#include <Arduino.h>

#include "iot/ble.h"

void setup() {
  Serial.begin(9600);
  delay(500);

  bleManager.setup();

  Serial.println("BLE initialized");
}

void loop() {
  BleManager::loop();
}