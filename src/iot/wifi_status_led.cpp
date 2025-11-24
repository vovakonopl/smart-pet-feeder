#include "iot/wifi_status_led.h"

void WifiStatusLed::displayStatus(const WifiStatus status) {
    switch (status) {
        case WifiStatus::Connected:
            Serial.println("LED: Connected");
            this->setColor(0, 255, 0);
            break;

        case WifiStatus::Disconnected:
            Serial.println("LED: Disconnected");
            this->setColor(255, 0, 0);
            break;

        case WifiStatus::Connecting:
            this->setColor(255, 140, 0);
            break;
    }
}
