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

// DHCP
#define LWIP_DHCP 1
#define LWIP_DNS 1

// Malloc
#define MEM_LIBC_MALLOC 0
#define MEM_ALIGNMENT 4
#define MEM_SIZE 4000
#define MEMP_NUM_TCP_SEG 32
#define MEMP_NUM_ARP_QUEUE 10
#define PBUF_POOL_SIZE 24

// Thread safety
#define SYS_LIGHTWEIGHT_PROT 1
#define LWIP_ALLOW_MEM_FREE_FROM_OTHER_CONTEXT 1

// Trace/Debug
#define LWIP_DEBUG 0
#define LWIP_STATS 0
