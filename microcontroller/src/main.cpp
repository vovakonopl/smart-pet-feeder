#include <cstdio>
#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"
#include "btstack.h"

extern "C" btstack_run_loop_t* btstack_run_loop_async_context_get_instance(void);

#include "iot/ble.h"
#include "iot/wifi.h"
#include "iot/mqtt.h"
#include "modules/rtc.h"
#include "feeder/feeder.h"

int main() {
    stdio_init_all();
    sleep_ms(2000); // Wait for USB serial
    printf("Starting Pet Feeder...\n");

    // Initialize CYW43 (WiFi + BT)
    if (cyw43_arch_init()) {
        printf("Failed to initialize cyw43_arch\n");
        return -1;
    }

    btstack_run_loop_init(btstack_run_loop_async_context_get_instance());
    
    rtc.init();
    feeder.setup();
    bleManager.setup();
    wifiManager.init();
    mqttManager.setup();

    // Turn on Bluetooth
    hci_power_control(HCI_POWER_ON);
    
    printf("Initialization Complete. Entering Loop.\n");

    while (true) {
        // BTstack runs in background via async_context (CYW43 worker)
        
        bleManager.loop();
        wifiManager.handleStatus();
        mqttManager.loop();
        feeder.loop();
        
        // Prevent tight loop
        sleep_ms(1);
    }
    
    return 0;
}