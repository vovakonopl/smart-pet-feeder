#include <pico/unique_id.h>

#include "utils/device_id.h"

// 1 byte = 2 hex chars
char deviceId[2 * PICO_UNIQUE_BOARD_ID_SIZE_BYTES + 1];

const char *getDeviceId() {
    if (deviceId[0] != '\0') {
        return deviceId;
    }

    pico_get_unique_board_id_string(deviceId, sizeof(deviceId));
    return deviceId;
}