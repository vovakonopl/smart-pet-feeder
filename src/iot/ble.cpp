#include <Arduino.h>
#include <ArduinoJson.h>
#include <BTstackLib.h>
#include <cstring>

#include "iot/wifi.h"

extern "C" {
#include "btstack.h"
}

#include "iot/ble.h"
#include "utils/device_id.h"
#include "constants/device_name.h"

// init static properties
uint16_t BleManager::notificationCharacteristic = 0;
hci_con_handle_t BleManager::connection = HCI_CON_HANDLE_INVALID;

// =-=-=-=-=-= Public Members =-=-=-=-=-=
BleManager::BleManager() : adv{0}, scanResp{0}, advLen(0), scanRespLen(0) {}

void BleManager::setup() {
  // set callbacks
  BTstack.setBLEDeviceConnectedCallback(BleManager::deviceConnectedCallback);
  BTstack.setBLEDeviceDisconnectedCallback(BleManager::deviceDisconnectedCallback);
  BTstack.setGATTCharacteristicRead(BleManager::gattReadCallback);
  BTstack.setGATTCharacteristicWrite(BleManager::gattWriteCallback);

  // add service
  BTstack.addGATTService(new UUID(BleManager::serviceUuid));

  // add characteristics
  // device id characteristic
  BTstack.addGATTCharacteristic(
    new UUID(BleManager::deviceIdReadCharUuid),
    ATT_PROPERTY_READ,
    getDeviceId()
  );

  // Wi-Fi config characteristic
  BTstack.addGATTCharacteristicDynamic(
    new UUID(BleManager::wifiConfigWriteCharUuid),
    ATT_PROPERTY_WRITE,
    0
  );

  // notify characteristic
  notificationCharacteristic = BTstack.addGATTCharacteristicDynamic(
    new UUID(BleManager::notificationCharUuid),
    ATT_PROPERTY_NOTIFY | ATT_PROPERTY_READ,
    0
  );

  buildAdvertisingData(this->adv, &this->advLen);
  buildScanRespData(this->scanResp, &this->scanRespLen);

  BTstack.setup();
  BTstack.setAdvData(advLen, adv);
  BTstack.setScanData(scanRespLen, scanResp);
  BTstack.startAdvertising();
}

void BleManager::loop() {
  BTstack.loop();
}

// =-=-=-=-=-= Public Members =-=-=-=-=-=
// adds Advertising data
uint8_t *BleManager::addAdField(uint8_t *ptr, const uint8_t type, const void *data, const uint8_t len) {
  *ptr++ = len + 1;
  *ptr++ = type;
  memcpy(ptr, data, len);

  ptr += len;
  return ptr;
}

// AD: LE General Discoverable + BR/EDR Not Supported
void BleManager::buildAdvertisingData(uint8_t *out, uint8_t *outLen) {
  uint8_t* p = out;

  constexpr uint8_t flags = 0x06;
  p = addAdField(p, 0x01, &flags, 1);

  *outLen = p - out;
}

void BleManager::buildScanRespData(uint8_t *out, uint8_t *outLen) {
  uint8_t* ptr = out;

  // AD #1: Complete Local Name (0x09)
  const uint8_t nameLen = strlen(deviceName);
  constexpr uint8_t nameAdType = 0x09;
  ptr = addAdField(ptr, nameAdType, deviceName, nameLen);

  // AD #2: Manufacturer Specific Data (0xFF)
  constexpr uint8_t companyIdFlag = 0xFF;
  constexpr uint16_t companyId = 0xFFFF; // testID
  constexpr auto manufacturerData = "FP:v-std"; // feeder version
  const size_t ascii_len = strlen(manufacturerData);

  constexpr uint8_t maxLength = 24;
  uint8_t mfg[sizeof(companyId) + maxLength];

  // store company ID in Little-Endian order
  mfg[0] = companyId & companyIdFlag; // LSB
  mfg[1] = ((companyId >> 8) & companyIdFlag); // MSB

  const uint8_t copyLen = ascii_len > maxLength ? maxLength : ascii_len;
  memcpy(&mfg[2], manufacturerData, copyLen);
  ptr = addAdField(ptr, companyIdFlag, mfg, 2 + copyLen);

  *outLen = ptr - out;
}

// =-=-=-=-=-=-=-= Callbacks =-=-=-=-=-=-=-= TODO: add real implementation
void BleManager::deviceConnectedCallback(const BLEStatus status, BLEDevice *device) {
  (void) device;
  switch (status) {
    case BLE_STATUS_OK:
      Serial.println("Device connected!");
      BleManager::connection = device->getHandle();
      break;
    default:
      break;
  }
}

void BleManager::deviceDisconnectedCallback(BLEDevice *_) {
  BleManager::connection = HCI_CON_HANDLE_INVALID;
  Serial.println("Disconnected.");
}

uint16_t BleManager::gattReadCallback(uint16_t, uint8_t *buffer, const uint16_t) {
  if (buffer) {
    Serial.println("gattReadCallback, value: ");
    // TODO: read
  }
  return 1;
}

namespace {
  void responseWithConnectionResult(WifiStatus status) {
    Notification notification;

    if (status == WifiStatus::Connected) {
      notification.setType(NotificationType::Success);
      notification.setBody("Successfully connected to Wi-Fi.");
    } else {
      notification.setType(NotificationType::Error);
      notification.setBody("Unable to connect to Wi-Fi.");
    }

    BleManager::sendNotification(notification);
  }
}

int BleManager::gattWriteCallback(uint16_t, uint8_t *buffer, const uint16_t size) {
  Serial.print("[BLE] write size = ");
  Serial.println(size);

  char json[size + 1];
  for (int i = 0; i < size; i++) {
    json[i] = buffer[i];
  }
  json[size] = '\0';

  Serial.print("[BLE] json: ");
  Serial.println(json);

  JsonDocument jsonDoc;
  if (deserializeJson(jsonDoc, json)) return 0; // if error

  WifiConfig config;
  config.ssid = jsonDoc["ssid"] | "";
  config.password = jsonDoc["password"] | "";
  wifiManager.connect(config, responseWithConnectionResult);

  return 1;
}

void BleManager::sendNotification(const Notification &notification) {
  if (connection == HCI_CON_HANDLE_INVALID) return;
  if (!notification.isReadyToSend()) return;

  const String notificationJson = notification.serialize();
  const int result = att_server_notify(
    connection,
    notificationCharacteristic,
    reinterpret_cast<const uint8_t *>(notificationJson.c_str()),
    notificationJson.length()
  );

  if (result == 0) {
    Serial.println("Notification sent successfully.");
  } else {
    Serial.print("Failed to send notification. Error: ");
    Serial.println(result);
  }
}
