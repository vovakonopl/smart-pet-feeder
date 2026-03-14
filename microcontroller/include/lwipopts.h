#pragma once

// Generally you would define your own explicit list of lwIP options here
// linking in pico_cyw43_arch_lwip_threadsafe_background (or poll)
// provides a set of defaults that are good for most use cases.

// We need to enable these to match the "threadsafe background" mode
#define NO_SYS 1
#define LWIP_SOCKET 0
#define LWIP_NETCONN 0

// Enable TCP/UDP
#define LWIP_TCP 1
#define LWIP_UDP 1

// TCP Tweaks for TLS
#define TCP_MSS 1460
#define TCP_WND (16 * TCP_MSS)
#define TCP_SND_BUF (8 * TCP_MSS)

// MQTT Tweaks
#define MQTT_CONNECT_TIMOUT 30

// DHCP
#define LWIP_DHCP 1
#define LWIP_DNS 1

// Malloc - Significantly increased for TLS
#define MEM_LIBC_MALLOC 0
#define MEM_ALIGNMENT 4
#define MEM_SIZE 128000
#define MEMP_NUM_TCP_SEG 32
#define MEMP_NUM_ARP_QUEUE 10
#define PBUF_POOL_SIZE 40
#define MEMP_NUM_SYS_TIMEOUT 15

// Thread safety
#define SYS_LIGHTWEIGHT_PROT 1
#define LWIP_ALLOW_MEM_FREE_FROM_OTHER_CONTEXT 1

// Trace/Debug
#define LWIP_DEBUG 1
#define ALTCP_MBEDTLS_DEBUG LWIP_DBG_ON
#define ALTCP_MBEDTLS_LIB_DEBUG LWIP_DBG_ON
#define LWIP_STATS 0

// ALTCP and TLS for MQTT
#define LWIP_ALTCP 1
#define LWIP_ALTCP_TLS 1
#define LWIP_ALTCP_TLS_MBEDTLS 1
