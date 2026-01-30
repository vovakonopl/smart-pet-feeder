cmake_minimum_required(VERSION 3.13)

# Set the SDK fetch flag before including the import file
set(PICO_SDK_FETCH_FROM_GIT ON)

# Initialize the SDK
include(pico_sdk_import.cmake)

project(pet_feeder C CXX ASM)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

if (PICO_SDK_VERSION_STRING VERSION_LESS "1.3.0")
    message(FATAL_ERROR "Raspberry Pi Pico SDK version 1.3.0 (or later) required. Your version is ${PICO_SDK_VERSION_STRING}")
endif()

# Initialize the Pico SDK
pico_sdk_init()

# --- Project Source Files ---
# Define the executable
add_executable(pet_feeder
    src/main.cpp
    src/feeder/feeder.cpp
    src/feeder/schedule.cpp
    src/feeder/schedule_item.cpp
    src/iot/ble.cpp
    src/iot/mqtt.cpp
    src/iot/wifi.cpp
    src/iot/wifi_status_led.cpp
    src/modules/rgb_led.cpp
    src/modules/rtc.cpp
    src/modules/servo_gate.cpp
    src/storage/last_fed_time_iso.cpp
    src/storage/schedule.cpp
    src/storage/utils.cpp
    src/storage/wifi_config.cpp
    src/storage/pico_hal.cpp
    src/utils/ble_notification.cpp
    src/utils/device_id.cpp
    # Vendor sources (must be present)
    lib/littlefs/lfs.c
    lib/littlefs/lfs_util.c
)

# --- Include Directories ---
target_include_directories(pet_feeder PRIVATE
    include
    src
    lib/ArduinoJson/src
    lib/littlefs
)

# --- Library Dependencies ---
# Link against Pico SDK libraries and our own libraries
target_link_libraries(pet_feeder
    pico_stdlib
    pico_cyw43_arch_lwip_threadsafe_background # Wi-Fi + lwIP (threadsafe background mode)
    pico_btstack_ble                           # Bluetooth LE
    pico_btstack_cyw43                         # Bluetooth HCI driver for CYW43
    hardware_pwm
    hardware_adc
    hardware_rtc
    hardware_flash
    hardware_sync
    hardware_i2c
    pico_lwip_mqtt
)

# --- PIO Programs ---
# Add any PIO programs here (e.g., WS2812)
pico_generate_pio_header(pet_feeder ${CMAKE_CURRENT_LIST_DIR}/src/modules/ws2812.pio)

# --- Configuration ---
# Enable USB stdio (UART is default, but USB is often useful)
pico_enable_stdio_usb(pet_feeder 1)
pico_enable_stdio_uart(pet_feeder 1)

# Create map/bin/hex/uf2 files
pico_add_extra_outputs(pet_feeder)

# --- Warnings and Options ---
# Enable standard warnings
target_compile_options(pet_feeder PRIVATE -Wall -Wextra)
