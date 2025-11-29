#include <Arduino.h>

#include "iot/ble.h"
#include "iot/wifi.h"
#include "iot/mqtt.h"
#include "modules/rtc.h"

void setup() {
  Serial.begin(115200);
  while (!Serial) {}

  bleManager.setup();
  wifiManager.init();
  rtc.init();
  mqttManager.setup();
  Serial.println("Initialized");
}

void loop() {
  BleManager::loop();
  wifiManager.handleStatus();
  mqttManager.loop();
}