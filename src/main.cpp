#include <Arduino.h>

#include "iot/ble.h"
#include "iot/wifi.h"

void setup() {
  Serial.begin(115200);
  while (!Serial) {}

  // TODO: try to connect to wifi and after that init BLE
  bleManager.setup();
  wifiManager.init();

  Serial.println("BLE initialized");
}

void loop() {
  BleManager::loop();
  wifiManager.handleStatus();
}