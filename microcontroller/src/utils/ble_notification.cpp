#include "utils/ble_notification.h"

namespace {
    // json keys
    constexpr auto TYPE_KEY = "type";
    constexpr auto BODY_KEY = "body";

    // stringified types
    constexpr auto ERROR_TYPE = "error";
    constexpr auto SUCCESS_TYPE = "success";
    constexpr auto INFO_TYPE = "info";
}

Notification::Notification() {
    this->json = JsonDocument();
}

Notification::Notification(const NotificationType type) : Notification() {
    this->setType(type);
}

Notification::Notification(const NotificationType type, const String &body) : Notification(type) {
    this->setBody(body);
}

void Notification::setType(const NotificationType type) {
    switch (type) {
        case NotificationType::Error:
            this->json[TYPE_KEY] = ERROR_TYPE;
            break;

        case NotificationType::Success:
            this->json[TYPE_KEY] = SUCCESS_TYPE;
            break;

        case NotificationType::Info:
            this->json[TYPE_KEY] = INFO_TYPE;
            break;

        default:
            Serial.println("ERROR! Unhandled notification type.");
    }
}

void Notification::setBody(const String &body) {
    this->json[BODY_KEY] = body;
}

bool Notification::isReadyToSend() const {
    return !this->json[TYPE_KEY].isNull();
}

String Notification::serialize() const {
    String json;
    serializeJson(this->json, json);

    return json;
}


