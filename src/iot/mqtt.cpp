#include "iot/mqtt.h"
#include "secrets.h"
#include "feeder/feeder.h"
#include "utils/device_id.h"

constexpr uint16_t bufferSize = 512;
namespace {
    String buildTopic(const char *topic) {
        const auto deviceId = getDeviceId();
        return String(secrets::TOPIC_PREFIX) + "/" + deviceId + topic;
    }
}

String MqttManager::topicGetStatus = buildTopic("get-status");
String MqttManager::topicFeedNow = buildTopic("feed-now");
String MqttManager::topicMoveNextFeedingForNow = buildTopic("next-feeding-now");
String MqttManager::topicScheduleUpdate = buildTopic("schedule-update");

void MqttManager::setup() {
    this->client = PubSubClient(this->net);
    MqttManager::mqttPayload.reserve(bufferSize);

    net.setInsecure();
    client.setServer(secrets::BROKER_HOST, secrets::BROKER_PORT);
    client.setCallback(MqttManager::callback);
    client.setBufferSize(bufferSize);

}

void MqttManager::loop() {
    if (WiFi.status() != WL_CONNECTED) return;
    if (!client.connected()) {
        this->reconnect();
    }

    client.loop();
}

void MqttManager::publishStatus(const char *statusJson) {
    if (!client.connected()) {
        Serial.println("disconnected");
        Serial.println(client.state());
        return;
    }

    Serial.println("connected");
    client.publish(MqttManager::topicGetStatus.c_str(), statusJson);
}

void MqttManager::reconnect() {
    Serial.print("Attempting MQTT connection...");

    // TODO: remove logs
    const String clientId = String("feeder-") + getDeviceId();
    if (!client.connect(clientId.c_str(), secrets::USERNAME, secrets::PASSWORD)) {
        Serial.print("failed, rc=");
        Serial.print(client.state());

        return;
    }

    Serial.println("connected");
    client.subscribe(MqttManager::topicGetStatus.c_str());
    client.subscribe(MqttManager::topicFeedNow.c_str());
    client.subscribe(MqttManager::topicMoveNextFeedingForNow.c_str());
    client.subscribe(MqttManager::topicScheduleUpdate.c_str());
}

void MqttManager::callback(char *topic, uint8_t *payload, unsigned int length) {
    const auto topicStr = String(topic);
    MqttManager::mqttPayload = "";

    for (unsigned int i = 0; i < length; i++) {
        MqttManager::mqttPayload += static_cast<char>(payload[i]);
    }

    Serial.print("Message received: ");
    Serial.println(MqttManager::mqttPayload);

    if (topicStr == MqttManager::topicGetStatus) {
        char buffer[bufferSize];
        feeder.writeStatusJson(buffer);
        mqttManager.publishStatus(buffer);

        return;
    }

    if (topicStr == MqttManager::topicFeedNow) {
        feeder.feed();
        return;
    }

    if (topicStr == MqttManager::topicMoveNextFeedingForNow) {
        feeder.moveNextFeedingForNow();
        return;
    }

    if (topicStr == MqttManager::topicScheduleUpdate) {
        feeder.setSchedule(mqttPayload.c_str());
        return;
    }
}
