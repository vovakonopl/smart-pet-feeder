#pragma once

#include <string>

enum class NotificationType {
    Error,
    Success,
    Info // any additional information
};

class Notification {
private:
    bool hasType;
    NotificationType type;
    std::string body;

public:
    Notification();
    explicit Notification(NotificationType type);
    explicit Notification(NotificationType type, const std::string &body);

    void setType(NotificationType type);
    void setBody(const std::string &body);

    bool isReadyToSend() const; // can be sent if type is set
    std::string serialize() const;
};