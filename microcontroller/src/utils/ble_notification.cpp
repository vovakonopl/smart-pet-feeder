#include "utils/ble_notification.h"

#include <cstdio>

namespace {
    // stringified types
    constexpr auto ERROR_TYPE = "error";
    constexpr auto SUCCESS_TYPE = "success";
    constexpr auto INFO_TYPE = "info";
}

Notification::Notification() : hasType(false) {
}

Notification::Notification(const NotificationType type) : hasType(true), type(type) {
}

Notification::Notification(const NotificationType type, const std::string &body) : hasType(true), type(type), body(body) {
}

void Notification::setType(const NotificationType type) {
    this->type = type;
    this->hasType = true;
}

void Notification::setBody(const std::string &body) {
    this->body = body;
}

bool Notification::isReadyToSend() const {
    return this->hasType;
}

std::string Notification::serialize() const {
    if (!hasType) {
        return "{}";
    }

    const char* typeStr = INFO_TYPE;
    switch (type) {
        case NotificationType::Error:   typeStr = ERROR_TYPE; break;
        case NotificationType::Success: typeStr = SUCCESS_TYPE; break;
        case NotificationType::Info:    typeStr = INFO_TYPE; break;
    }

    // Simple JSON construction: {"type":"...","body":"..."}
    // We need to escape quotes in body if we were full compliant, 
    // but for now we assume simple messages.
    std::string json = "{";
    json += "\"type\":\"";
    json += typeStr;
    json += "\"";
    
    if (!body.empty()) {
        json += ",\"body\":\"";
        json += body;
        json += "\"";
    }
    
    json += "}";

    return json;
}
