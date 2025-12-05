#pragma once

#include <WiFiClientSecure.h>
#include <PubSubClient.h>

class MqttManager {
private:
    WiFiClientSecure net;
    PubSubClient client;
    static String mqttPayload;

    void reconnect();
    static void callback(char *topic, uint8_t *payload, unsigned int length);

public:
    static String topicStatusRequest;
    static String topicStatusResponse;
    static String topicFeedNow;
    static String topicMoveNextFeedingToNow;
    static String topicScheduleUpdate;

    void setup();
    void loop();
    void publishStatus();
    void publishStatus(const char *statusJson);
};

inline MqttManager mqttManager;