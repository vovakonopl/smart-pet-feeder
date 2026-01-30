#include "iot/mqtt.h"
#include "secrets.h"
#include "feeder/feeder.h"
#include "utils/device_id.h"
#include "constants/buffer_size.h"
#include "iot/wifi.h" // for wifiManager status
#include <cstdio>
#include <cstring>
#include "pico/cyw43_arch.h"
#include "lwip/dns.h"

namespace {
    std::string buildTopic(const char *topic) {
        const auto deviceId = getDeviceId();
        return std::string(secrets::TOPIC_PREFIX) + "/" + deviceId + "/" + topic;
    }
}

// Global instance
MqttManager mqttManager;

// Static member init
std::string MqttManager::topicStateRequest;
std::string MqttManager::topicStateResponse;
std::string MqttManager::topicFeedNow;
std::string MqttManager::topicMoveNextFeedingToNow;
std::string MqttManager::topicScheduleUpdate;

MqttManager::MqttManager() : client(nullptr), resolving(false), isReceiving(false) {}

void MqttManager::setup() {
    // Initialize topics
    topicStateRequest = buildTopic("state-req");
    topicStateResponse = buildTopic("state-resp");
    topicFeedNow = buildTopic("feed-now");
    topicMoveNextFeedingToNow = buildTopic("next-feeding-now");
    topicScheduleUpdate = buildTopic("schedule-update");

    this->client = mqtt_client_new();
    if (!this->client) {
        printf("MQTT: Failed to create client\n");
    }
}

void MqttManager::loop() {
    if (wifiManager.getStatus() != WifiStatus::Connected) return;
    if (!client) return;

    if (!mqtt_client_is_connected(client) && !resolving) {
        // Try to reconnect
        // First resolve DNS
        printf("MQTT: Resolving %s...\n", secrets::BROKER_HOST);
        resolving = true;
        
        cyw43_arch_lwip_begin();
        err_t err = dns_gethostbyname(secrets::BROKER_HOST, &brokerIp, dns_found_cb, this);
        cyw43_arch_lwip_end();

        if (err == ERR_OK) {
            // Cached
            dns_found_cb(secrets::BROKER_HOST, &brokerIp, this);
        } else if (err != ERR_INPROGRESS) {
            printf("MQTT: DNS Failed %d\n", err);
            resolving = false;
        }
    }
}

void MqttManager::dns_found_cb(const char *name, const ip_addr_t *ipaddr, void *callback_arg) {
    MqttManager *self = static_cast<MqttManager*>(callback_arg);
    self->resolving = false;

    if (ipaddr) {
        self->brokerIp = *ipaddr;
        printf("MQTT: DNS resolved. Connecting...\n");
        self->reconnect();
    } else {
        printf("MQTT: DNS resolution failed for %s\n", name);
    }
}

void MqttManager::reconnect() {
    struct mqtt_connect_client_info_t ci;
    memset(&ci, 0, sizeof(ci));
    
    std::string clientId = std::string("feeder-") + getDeviceId();
    ci.client_id = clientId.c_str();
    ci.client_user = secrets::USERNAME;
    ci.client_pass = secrets::PASSWORD;
    ci.keep_alive = 60;
    
    cyw43_arch_lwip_begin();
    mqtt_client_connect(client, &brokerIp, secrets::BROKER_PORT, mqtt_connection_cb, this, &ci);
    cyw43_arch_lwip_end();
}

void MqttManager::mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status) {
    (void)client;
    MqttManager *self = static_cast<MqttManager*>(arg);
    self->onConnect(status);
}

void MqttManager::onConnect(mqtt_connection_status_t status) {
    if (status == MQTT_CONNECT_ACCEPTED) {
        printf("MQTT: Connected!\n");
        
        // Setup incoming callbacks
        mqtt_set_inpub_callback(client, mqtt_incoming_publish_cb, mqtt_incoming_data_cb, this);

        // Subscribe
        mqtt_sub_unsub(client, topicStateRequest.c_str(), 0, mqtt_pub_request_cb, this, 1);
        mqtt_sub_unsub(client, topicFeedNow.c_str(), 0, mqtt_pub_request_cb, this, 1);
        mqtt_sub_unsub(client, topicMoveNextFeedingToNow.c_str(), 0, mqtt_pub_request_cb, this, 1);
        mqtt_sub_unsub(client, topicScheduleUpdate.c_str(), 0, mqtt_pub_request_cb, this, 1);

        publishState();
    } else {
        printf("MQTT: Connect failed: %d\n", status);
    }
}

void MqttManager::mqtt_incoming_publish_cb(void *arg, const char *topic, u32_t tot_len) {
    (void)tot_len;
    MqttManager *self = static_cast<MqttManager*>(arg);
    self->onIncomingPublish(topic, tot_len);
}

void MqttManager::onIncomingPublish(const char *topic, u32_t tot_len) {
    (void)tot_len;
    incomingTopic = topic;
    incomingPayload.clear();
    isReceiving = true;
}

void MqttManager::mqtt_incoming_data_cb(void *arg, const u8_t *data, u16_t len, u8_t flags) {
    MqttManager *self = static_cast<MqttManager*>(arg);
    self->onIncomingData(data, len, flags);
}

void MqttManager::onIncomingData(const u8_t *data, u16_t len, u8_t flags) {
    if (isReceiving) {
        incomingPayload.append((const char*)data, len);

        if (flags & MQTT_DATA_FLAG_LAST) {
            isReceiving = false;
            
            // Dispatch
            if (incomingTopic == topicStateRequest) {
                publishState();
            } else if (incomingTopic == topicFeedNow) {
                feeder.feed();
                publishState();
            } else if (incomingTopic == topicMoveNextFeedingToNow) {
                feeder.moveNextFeedingForNow();
                publishState();
            } else if (incomingTopic == topicScheduleUpdate) {
                feeder.setSchedule(incomingPayload.c_str());
                publishState();
            }
        }
    }
}

void MqttManager::mqtt_pub_request_cb(void *arg, err_t result) {
    (void)arg;
    if (result != ERR_OK) {
        printf("MQTT: Subscribe/Publish failed: %d\n", result);
    }
}

void MqttManager::publishState() {
    char buffer[BUFFER_SIZE];
    if (feeder.writeStateJson(buffer)) {
        publishState(buffer);
    }
}

void MqttManager::publishState(const char *stateJson) {
    if (!isConnected()) return;

    err_t err = mqtt_publish(client, topicStateResponse.c_str(), stateJson, strlen(stateJson), 0, 0, mqtt_pub_request_cb, this);
    if (err != ERR_OK) {
        printf("MQTT: Publish failed: %d\n", err);
    }
}

bool MqttManager::isConnected() const {
    return client && mqtt_client_is_connected(client);
}