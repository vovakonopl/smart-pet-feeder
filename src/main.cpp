#include <Arduino.h>

#include "iot/ble.h"
#include "iot/wifi.h"
#include "modules/rtc.h"

void setup() {
  Serial.begin(115200);
  while (!Serial) {}

  bleManager.setup();
  wifiManager.init();
  rtc.init();
  Serial.println("BLE initialized");
}

void loop() {
  BleManager::loop();
  wifiManager.handleStatus();
}