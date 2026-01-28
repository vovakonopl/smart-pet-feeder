#include "iot/wifi_status_led.h"

void WifiStatusLed::displayStatus(const WifiStatus status) {
    switch (status) {
        case WifiStatus::Connected:
            this->setColor(0, 255, 0);
            break;

        case WifiStatus::Disconnected:
            this->setColor(255, 0, 0);
            break;

        case WifiStatus::Connecting:
            this->setColor(255, 140, 0);
            break;
    }
}
