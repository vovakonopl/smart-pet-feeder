#pragma once

#include <string>
#include "lwip/apps/mqtt.h"
#include "lwip/ip_addr.h"

class MqttManager {
private:
    mqtt_client_t *client;
    ip_addr_t brokerIp;
    bool resolving;
    bool connecting;
    uint32_t lastConnectionAttemptMs;

    // Payload buffering
    std::string incomingTopic;
    std::string incomingPayload;
    bool isReceiving;

    struct altcp_tls_config *tls_config;

    void reconnect();
    
    // Callbacks
    static void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
    static void mqtt_incoming_publish_cb(void *arg, const char *topic, u32_t tot_len);
    static void mqtt_incoming_data_cb(void *arg, const u8_t *data, u16_t len, u8_t flags);
    static void mqtt_pub_request_cb(void *arg, err_t result);
    static void dns_found_cb(const char *name, const ip_addr_t *ipaddr, void *callback_arg);

    void onConnect(mqtt_connection_status_t status);
    void onIncomingPublish(const char *topic, u32_t tot_len);
    void onIncomingData(const u8_t *data, u16_t len, u8_t flags);

public:
    static std::string topicStateRequest;
    static std::string topicStateResponse;
    static std::string topicFeedNow;
    static std::string topicMoveNextFeedingToNow;
    static std::string topicScheduleUpdate;

    MqttManager();
    void setup();
    void loop();
    void publishState();
    void publishState(const char *stateJson);
    
    bool isConnected() const;
};

extern MqttManager mqttManager;