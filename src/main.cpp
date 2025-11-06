#include <Arduino.h>

#include "iot/ble.h"
#include "iot/wifi.h"
#include "storage/wifi_config.h"

void setup() {
  Serial.begin(115200);
  while (!Serial) {}

  bleManager.setup();
  wifiManager.init();

  Serial.println("BLE initialized");
}

void loop() {
  BleManager::loop();
  wifiManager.handleStatus();
}