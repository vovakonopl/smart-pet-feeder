#include "modules/servo_gate.h"
#include <cstdio>
#include "pico/stdlib.h"
#include "hardware/pwm.h"
#include "hardware/clocks.h"

ServoGate::ServoGate(const uint8_t pin) {
    this->pin = pin;
    this->isOpened = false;
    this->openedAtMs = 0;
    this->timeoutMs = 0;
}

void ServoGate::setup() {
    gpio_set_function(pin, GPIO_FUNC_PWM);
    uint slice_num = pwm_gpio_to_slice_num(pin);

    // Get clock speed and calculate divider for 50 Hz
    // 50Hz = 20ms period.
    // If we want 1 count = 1us, we need 1MHz clock into PWM.
    // Sysclock (125MHz) / 125 = 1MHz.
    
    float div = static_cast<float>(clock_get_hz(clk_sys)) / 1000000.0f;
    
    pwm_config config = pwm_get_default_config();
    pwm_config_set_clkdiv(&config, div);
    pwm_config_set_wrap(&config, 20000); // 20ms period (20000us)

    pwm_init(slice_num, &config, true);

    close();
}

void ServoGate::loop() {
    if (!this->isOpened) return;
    if (to_ms_since_boot(get_absolute_time()) < this->openedAtMs + this->timeoutMs) return;

    this->close();
}

void ServoGate::open() {
    writeAngle(ServoGate::angleOpen);
    this->isOpened = true;
    printf("Opened\n");
}

void ServoGate::close() {
    writeAngle(ServoGate::angleClosed);
    this->isOpened = false;
    printf("Closed\n");
}

void ServoGate::openForMs(const uint16_t ms) {
    this->openedAtMs = to_ms_since_boot(get_absolute_time());
    this->timeoutMs = ms;

    this->open();
}

void ServoGate::writeAngle(uint8_t angle) {
    // Map 0-180 to 500-2400us (approx)
    // 0 -> 544us
    // 180 -> 2400us
    // pulse = 544 + (angle * (2400 - 544) / 180)
    
    if (angle > 180) angle = 180;
    
    uint16_t pulseUs = 544 + (uint16_t)((uint32_t)angle * (2400 - 544) / 180);
    setPwm(pulseUs);
}

void ServoGate::setPwm(uint16_t pulseUs) {
    pwm_set_gpio_level(pin, pulseUs);
}
