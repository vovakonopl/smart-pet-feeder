#include "secrets.h"
#include "feeder/feeder.h"
#include "utils/device_id.h"
#include "constants/buffer_size.h"
#include "iot/mqtt.h"

namespace {
    String buildTopic(const char *topic) {
        const auto deviceId = getDeviceId();
        return String(secrets::TOPIC_PREFIX) + "/" + deviceId + "/" + topic;
    }
}

String MqttManager::mqttPayload = "";
String MqttManager::topicStateRequest = buildTopic("state-req");
String MqttManager::topicStateResponse = buildTopic("state-resp");
String MqttManager::topicFeedNow = buildTopic("feed-now");
String MqttManager::topicMoveNextFeedingToNow = buildTopic("next-feeding-now");
String MqttManager::topicScheduleUpdate = buildTopic("schedule-update");

void MqttManager::setup() {
    this->client = PubSubClient(this->net);
    MqttManager::mqttPayload.reserve(BUFFER_SIZE);

    net.setInsecure();
    client.setServer(secrets::BROKER_HOST, secrets::BROKER_PORT);
    client.setCallback(MqttManager::callback);
    client.setBufferSize(BUFFER_SIZE);
}

void MqttManager::loop() {
    if (WiFi.status() != WL_CONNECTED) return;
    if (!client.connected()) {
        this->reconnect();
    }

    client.loop();
}

void MqttManager::publishState() {
    if (!client.connected()) {
        Serial.println(client.state());
        return;
    }

    char buffer[BUFFER_SIZE];
    feeder.writeStateJson(buffer);
    mqttManager.publishState(buffer);
}

void MqttManager::publishState(const char *stateJson) {
    if (!client.connected()) {
        Serial.println(client.state());
        return;
    }

    client.publish(MqttManager::topicStateResponse.c_str(), stateJson);
}

void MqttManager::reconnect() {
    const String clientId = String("feeder-") + getDeviceId();
    if (!client.connect(clientId.c_str(), secrets::USERNAME, secrets::PASSWORD)) {
        return;
    }

    client.subscribe(MqttManager::topicStateRequest.c_str());
    client.subscribe(MqttManager::topicFeedNow.c_str());
    client.subscribe(MqttManager::topicMoveNextFeedingToNow.c_str());
    client.subscribe(MqttManager::topicScheduleUpdate.c_str());

    // publish state on reconnect
    char buffer[BUFFER_SIZE];
    feeder.writeStateJson(buffer);
    this->publishState(buffer);
}

void MqttManager::callback(char *topic, uint8_t *payload, unsigned int length) {
    const auto topicStr = String(topic);
    MqttManager::mqttPayload = "";

    for (unsigned int i = 0; i < length; i++) {
        MqttManager::mqttPayload += static_cast<char>(payload[i]);
    }

    if (topicStr == MqttManager::topicStateRequest) {
        mqttManager.publishState();
        return;
    }

    if (topicStr == MqttManager::topicFeedNow) {
        feeder.feed();
        mqttManager.publishState();
        return;
    }

    if (topicStr == MqttManager::topicMoveNextFeedingToNow) {
        feeder.moveNextFeedingForNow();
        mqttManager.publishState();
        return;
    }

    if (topicStr == MqttManager::topicScheduleUpdate) {
        feeder.setSchedule(mqttPayload.c_str());
        mqttManager.publishState();
        return;
    }
}
