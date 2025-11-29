#include "iot/mqtt.h"

#include "secrets.h"
#include "utils/device_id.h"

MqttManager::MqttManager() : client(net) {
    const String deviceId = getDeviceId();

    // form topics with device id
    this->topicCommand =
        String(secrets::TOPIC_PREFIX) + "/" + deviceId + "/command";
    this->topicStatus
    = String(secrets::TOPIC_PREFIX) + "/" + deviceId + "/status";
}

void MqttManager::setup() {
    net.setInsecure();
    client.setServer(secrets::BROKER_HOST, secrets::BROKER_PORT);
    client.setCallback(MqttManager::callback);
    client.setBufferSize(512);
}

void MqttManager::loop() {
    if (WiFi.status() != WL_CONNECTED) return;
    if (!client.connected()) {
        this->reconnect();
    }

    client.loop();
}

void MqttManager::publishStatus(const char* statusJson) {
    if (client.connected()) {
        Serial.println("connected");
        client.publish(this->topicStatus.c_str(), statusJson);
    } else {
        Serial.println("disconnected");
        Serial.println(client.state());
    }
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
    client.subscribe(this->topicCommand.c_str());
    Serial.print("Subscribed to: ");
    Serial.println(this->topicCommand);
}

void MqttManager::callback(char* topic, uint8_t* payload, unsigned int length) {
    auto topicStr = String(topic);

    if (topicStr == mqttManager.topicCommand) {
        String message;
        for (unsigned int i = 0; i < length; i++) {
            message += static_cast<char>(payload[i]);
        }

        Serial.print("CMD received: ");
        Serial.println(message);

        // TODO: parse JSON and handle it
    }
}
