#include <Arduino.h>

#include "iot/ble.h"
#include "iot/wifi.h"
#include "iot/mqtt.h"
#include "modules/rtc.h"
#include "feeder/feeder.h"

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    if (millis() >= 2000) break;
  }

  bleManager.setup();
  wifiManager.init();
  mqttManager.setup();
  rtc.init();
  feeder.setup();
  Serial.println("Initialized");
}

void loop() {
  BleManager::loop();
  wifiManager.handleStatus();
  mqttManager.loop();
  feeder.loop();
}