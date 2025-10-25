#pragma once
#include <BTstackLib.h>

class BleManager {
private:
    static uint16_t notificationCharacteristic;
    static hci_con_handle_t connectionStatus;

    static constexpr auto serviceUuid = "b2489703-07aa-40e0-98a1-27b7c50515fa";
    static constexpr auto deviceIdReadCharUuid = "2487b20c-3955-4663-9990-94d59fd28d21";
    static constexpr auto wifiConfigWriteCharUuid = "45ea3548-b92a-4b1d-a76a-59e52800f5a7";
    static constexpr auto notificationCharUuid = "b0761e9c-584d-46d1-9d8c-d45c06d922e5a";

    // Advertisement data
    static constexpr uint8_t maxPayloadLength = 31;
    uint8_t adv[maxPayloadLength], scanResp[maxPayloadLength];
    uint8_t advLen, scanRespLen;

    // BLE setup utils
    static uint8_t *addAdField(uint8_t *ptr, uint8_t type, const void *data, uint8_t len);
    static void buildAdvertisingData(uint8_t *out, uint8_t *outLen);
    static void buildScanRespData(uint8_t *out, uint8_t *outLen);

    // Callbacks
    static void deviceConnectedCallback(BLEStatus status, BLEDevice *device);
    static void deviceDisconnectedCallback(BLEDevice *_);
    static uint16_t gattReadCallback(uint16_t value_handle, uint8_t * buffer, uint16_t buffer_size);
    static int gattWriteCallback(uint16_t value_handle, uint8_t *buffer, uint16_t size);

public:
    BleManager();

    void setup();
    static void loop();
};

inline BleManager bleManager;