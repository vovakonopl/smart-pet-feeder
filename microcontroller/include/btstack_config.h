#pragma once

// BTstack features that can be enabled
#define HAVE_MALLOC
#define ENABLE_LOG_INFO
#define ENABLE_LOG_ERROR
// #define ENABLE_BLE // Defined by CMake
#define ENABLE_LE_PERIPHERAL
#define ENABLE_LE_CENTRAL
#define ENABLE_PRINTF_HEXDUMP

// BTstack configuration. buffers, sizes, ...
#define HCI_OUTGOING_PRE_BUFFER_SIZE 4
#define HCI_ACL_PAYLOAD_SIZE (255 + 4)
#define HCI_ACL_CHUNK_SIZE_ALIGNMENT 4
#define MAX_NR_HCI_CONNECTIONS 1
#define MAX_NR_L2CAP_CHANNELS  0
#define MAX_NR_RFCOMM_CHANNELS 0
#define MAX_NR_SM_LOOKUP_ENTRIES 3
#define MAX_NR_WHITELIST_ENTRIES 1
#define MAX_NR_LE_DEVICE_DB_ENTRIES 16

// Limit number of ACL packets to 7 to allow for 1 high priority event packet
#define MAX_NR_HCI_ACL_PACKETS_LEN (255 + 4)
#define MAX_NR_HCI_ACL_PACKETS_COUNT 7

#define NVM_NUM_DEVICE_DB_ENTRIES 16
