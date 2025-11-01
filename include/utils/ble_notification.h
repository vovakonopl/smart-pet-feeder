#pragma once

#include <ArduinoJson.h>

enum class NotificationType {
    Error,
    Success,
    Info // any additional information
};

class Notification {
private:
    JsonDocument json;

public:
    Notification();
    explicit Notification(NotificationType type);
    explicit Notification(NotificationType type, const String &body);

    void setType(NotificationType type);
    void setBody(const String &body);

    bool isReadyToSend() const; // can be sent if type field is not null
    String serialize() const;
};