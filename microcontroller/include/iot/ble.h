#pragma once

#include "btstack.h"
#include <cstdint>
#include "utils/ble_notification.h"

class BleManager {
private:
    static hci_con_handle_t connection_handle;
    static uint16_t notification_characteristic_value_handle;

    // UUIDs strings
    static constexpr auto serviceUuidStr = "b2489703-07aa-40e0-98a1-27b7c50515fa";
    static constexpr auto deviceIdReadCharUuidStr = "2487b20c-3955-4663-9990-94d59fd28d21";
    static constexpr auto wifiConfigWriteCharUuidStr = "45ea3548-b92a-4b1d-a76a-59e52800f5a7";
    static constexpr auto notificationCharUuidStr = "b0761e9c-584d-46d1-9d8c-d45c06d922e5a";

    static void packet_handler(uint8_t packet_type, uint16_t channel, uint8_t *packet, uint16_t size);
    static uint16_t att_read_callback(hci_con_handle_t connection_handle, uint16_t att_handle, uint16_t offset, uint8_t * buffer, uint16_t buffer_size);
    static int att_write_callback(hci_con_handle_t connection_handle, uint16_t att_handle, uint16_t transaction_mode, uint16_t offset, uint8_t *buffer, uint16_t buffer_size);

public:
    BleManager();
    void setup();
    void loop(); // Polls if needed, or just let stack run

    static void sendNotification(const Notification &notification);
};

extern BleManager bleManager;