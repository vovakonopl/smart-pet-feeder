#include "iot/ble.h"
#include "iot/wifi.h"
#include "utils/device_id.h"
#include "constants/device_name.h"
#include "pico/cyw43_arch.h"
#include "pico/stdlib.h"
#include "btstack.h"
#include "ble/att_db.h"
#include "ble/att_server.h"
#include <cstdio>
#include <cstring>
#include <ArduinoJson.h>

namespace {
    void uuid128FromString(const char* str, uint8_t* uuid) {
        int i = 0;
        int j = 0;
        while (i < 16) {
            if (str[j] == '-') {
                j++;
                continue;
            }
            char high = str[j++];
            char low = str[j++];
            
            uint8_t byte = 0;
            if (high >= '0' && high <= '9') byte = (high - '0') << 4;
            else if (high >= 'a' && high <= 'f') byte = (high - 'a' + 10) << 4;
            else if (high >= 'A' && high <= 'F') byte = (high - 'A' + 10) << 4;

            if (low >= '0' && low <= '9') byte |= (low - '0');
            else if (low >= 'a' && low <= 'f') byte |= (low - 'a' + 10);
            else if (low >= 'A' && low <= 'F') byte |= (low - 'A' + 10);
            
            // UUIDs in string are big endian (usually), BTstack wants little endian for some apis
            uuid[i++] = byte;
        }
    }

    uint16_t wifiConfigHandle = 0;
    uint16_t deviceIdHandle = 0;

    void wifiConnectResponse(WifiStatus status) {
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

    btstack_packet_callback_registration_t hciEventCallbackRegistration;
}

BleManager bleManager;

hci_con_handle_t BleManager::connection_handle = HCI_CON_HANDLE_INVALID;
uint16_t BleManager::notification_characteristic_value_handle = 0;

BleManager::BleManager() {}

void BleManager::setup() {
    // Initialize AT T DB
    att_db_util_init();

    // GAP Service
    att_db_util_add_service_uuid16(ORG_BLUETOOTH_SERVICE_GENERIC_ACCESS);
    att_db_util_add_characteristic_uuid16(ORG_BLUETOOTH_CHARACTERISTIC_GAP_DEVICE_NAME, ATT_PROPERTY_READ, ATT_SECURITY_NONE, ATT_SECURITY_NONE, (uint8_t*)deviceName, strlen(deviceName));

    // Custom Service
    uint8_t service_uuid[16];
    uuid128FromString(serviceUuidStr, service_uuid);
    att_db_util_add_service_uuid128(service_uuid);

    uint8_t devIdUuid[16];
    uuid128FromString(deviceIdReadCharUuidStr, devIdUuid);
    deviceIdHandle = att_db_util_add_characteristic_uuid128(devIdUuid, ATT_PROPERTY_READ, ATT_SECURITY_NONE, ATT_SECURITY_NONE, NULL, 0);

    uint8_t wifiUuid[16];
    uuid128FromString(wifiConfigWriteCharUuidStr, wifiUuid);
    wifiConfigHandle = att_db_util_add_characteristic_uuid128(wifiUuid, ATT_PROPERTY_WRITE, ATT_SECURITY_NONE, ATT_SECURITY_NONE, NULL, 0);

    uint8_t notifUuid[16];
    uuid128FromString(notificationCharUuidStr, notifUuid);
    notification_characteristic_value_handle = att_db_util_add_characteristic_uuid128(notifUuid, ATT_PROPERTY_NOTIFY | ATT_PROPERTY_READ, ATT_SECURITY_NONE, ATT_SECURITY_NONE, NULL, 0);

    // Initialize ATT Server
    att_server_init(att_db_util_get_address(), att_read_callback, att_write_callback);

    hciEventCallbackRegistration.callback = &packet_handler;
    hci_add_event_handler(&hciEventCallbackRegistration);

    constexpr uint16_t advIntMin = 800;
    constexpr uint16_t advIntMax = 800;
    constexpr uint8_t advType = 0;
    bd_addr_t nullAddr;
    memset(nullAddr, 0, 6);
    gap_advertisements_set_params(advIntMin, advIntMax, advType, 0, nullAddr, 0x07, 0x00);
    
    uint8_t advData[31];
    uint8_t advLen = 0;
    advData[advLen++] = 2;
    advData[advLen++] = 0x01;
    advData[advLen++] = 0x06;

    gap_advertisements_set_data(advLen, advData);
    gap_advertisements_enable(1);

    // Manufacturer Data
    uint8_t scanResp[31];
    uint8_t scanLen = 0;
    uint8_t nameLen = strlen(deviceName);
    scanResp[scanLen++] = nameLen + 1;
    scanResp[scanLen++] = 0x09;
    memcpy(&scanResp[scanLen], deviceName, nameLen);
    scanLen += nameLen;
    
    gap_scan_response_set_data(scanLen, scanResp);
}

void BleManager::loop() {
    // BTstack runs in background on Pico W (threadsafe mode)
}

void BleManager::packet_handler(uint8_t packet_type, uint16_t channel, uint8_t *packet, uint16_t size) {
    if (packet_type != HCI_EVENT_PACKET) return;

    uint8_t eventType = hci_event_packet_get_type(packet);
    switch (eventType) {
        case HCI_EVENT_LE_META:
            // Handle connection complete?
            break;

        case HCI_EVENT_DISCONNECTION_COMPLETE:
            connection_handle = HCI_CON_HANDLE_INVALID;
            wifiManager.clearOnConnectionResult();
            gap_advertisements_enable(1);
            break;
    }
}

uint16_t BleManager::att_read_callback(hci_con_handle_t connection_handle, uint16_t att_handle, uint16_t offset, uint8_t* buffer, uint16_t buffer_size) {
    if (att_handle == deviceIdHandle) {
        const char* devId = getDeviceId();
        return att_read_callback_handle_blob(
            reinterpret_cast<const uint8_t*>(devId),
            strlen(devId),
            offset,
            buffer,
            buffer_size
        );
    }
    return 0;
}



int BleManager::att_write_callback(hci_con_handle_t connHandle, uint16_t att_handle, uint16_t transaction_mode, uint16_t offset, uint8_t* buffer, uint16_t buffer_size) {
    if (transaction_mode != ATT_TRANSACTION_MODE_NONE) return 0;

    if (att_handle == wifiConfigHandle) {
        char json[buffer_size + 1];
        memcpy(json, buffer, buffer_size);
        json[buffer_size] = 0;

        JsonDocument jsonDoc;
        if (!deserializeJson(jsonDoc, json)) {
            WifiConfig config;
            config.ssid = static_cast<const char*>(jsonDoc["ssid"]);
            config.password = static_cast<const char*>(jsonDoc["password"]);
            wifiManager.connect(config, wifiConnectResponse);
        }
        return 0;
    }
    
    if (att_handle == notification_characteristic_value_handle + 1 && buffer_size == 2) {
        uint16_t val = little_endian_read_16(buffer, 0);
        if (val == 2 || val == 1) {
            connection_handle = connHandle;
        }
    }

    return 0;
}

void BleManager::sendNotification(const Notification& notification) {
    if (connection_handle == HCI_CON_HANDLE_INVALID) return;
    if (!notification.isReadyToSend()) return;

    std::string json = notification.serialize();
    att_server_notify(connection_handle, notification_characteristic_value_handle, reinterpret_cast<uint8_t*>(const_cast<char*>(json.c_str())), json.length());
}
