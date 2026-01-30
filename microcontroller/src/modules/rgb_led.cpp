#include "modules/rgb_led.h"
#include "ws2812.pio.h" 
#include "hardware/clocks.h"

RgbLed::RgbLed(const uint8_t pin) : pin(pin), pio(pio0), sm(0) {
    // pio and sm assignment might need management if multiple PIO blocks are used,
    // but for now we hardcode pio0 and claim an unused SM.
}

void RgbLed::setup() {
    // Claim a state machine
    int sm_claimed = pio_claim_unused_sm(pio, true);
    if (sm_claimed < 0) {
        // Fallback to pio1 if pio0 is full
        pio = pio1;
        sm_claimed = pio_claim_unused_sm(pio, true);
    }

    this->sm = (uint)sm_claimed;

    // Load the program
    uint offset = pio_add_program(pio, &ws2812_program);

    // Initialize the program
    ws2812_program_init(pio, sm, offset, pin, 800000, false);
}

void RgbLed::turnOff() {
    setColor(0, 0, 0);
}

void RgbLed::setColor(const uint8_t red, const uint8_t green, const uint8_t blue) {
    // WS2812 expects GRB format
    uint32_t pixel_grb = 
        ((uint32_t)(green) << 16) |
        ((uint32_t)(red) << 8)  |
        (uint32_t)(blue);

    putPixel(pixel_grb);
}

void RgbLed::putPixel(uint32_t pixel_grb) {
    pio_sm_put_blocking(pio, sm, pixel_grb << 8u);
}
