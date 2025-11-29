#pragma once

// has no real data and shows which secrets are used in project
namespace secrets {
    constexpr const char* BROKER_HOST = "mqtt.broker.host";
    constexpr int BROKER_PORT = 8883;

    constexpr const char* USERNAME = "broker_user";
    constexpr const char* PASSWORD = "broker_password";

    constexpr const char* TOPIC_PREFIX = "prefix";
}