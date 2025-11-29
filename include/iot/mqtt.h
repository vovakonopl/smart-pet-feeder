#pragma once

#include <WiFiClientSecure.h>
#include <PubSubClient.h>

class MqttManager {
private:
    WiFiClientSecure net;
    PubSubClient client;

    String topicCommand;
    String topicStatus;

    void reconnect();
    static void callback(char* topic, uint8_t* payload, unsigned int length);

public:
    MqttManager();

    void setup();
    void loop();
    void publishStatus(const char* statusJson);
};

inline MqttManager mqttManager;