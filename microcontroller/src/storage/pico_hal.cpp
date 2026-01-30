#include "storage/pico_hal.h"
#include "hardware/flash.h"
#include "hardware/sync.h"
#include <cstring>

// Default to 2MB if not defined (Pico W standard)
#ifndef PICO_FLASH_SIZE_BYTES
#define PICO_FLASH_SIZE_BYTES (2 * 1024 * 1024)
#endif

// Filesystem size: 512KB
#define FS_SIZE_BYTES (512 * 1024)
#define BLOCK_SIZE_BYTES 4096

// Calculate base address: End of flash - FS Size
static const uint32_t FS_BASE_OFFSET = PICO_FLASH_SIZE_BYTES - FS_SIZE_BYTES;

namespace storage {

lfs_t lfs;
struct lfs_config cfg;

int pico_read(const struct lfs_config *c, lfs_block_t block, lfs_off_t off, void *buffer, lfs_size_t size) {
    (void)c;
    // Reading from XIP memory mapped flash is just a memcpy
    // Address = XIP_BASE + FS_OFFSET + Block Offset + Read Offset
    uint32_t addr = FS_BASE_OFFSET + (block * BLOCK_SIZE_BYTES) + off;
    memcpy(buffer, (const void *)(XIP_BASE + addr), size);
    return 0;
}

int pico_prog(const struct lfs_config *c, lfs_block_t block, lfs_off_t off, const void *buffer, lfs_size_t size) {
    (void)c;
    uint32_t addr = FS_BASE_OFFSET + (block * BLOCK_SIZE_BYTES) + off;
    
    // Flash operations must run with interrupts disabled if code is in flash
    uint32_t ints = save_and_disable_interrupts();
    flash_range_program(addr, (const uint8_t*)buffer, size);
    restore_interrupts(ints);
    
    return 0;
}

int pico_erase(const struct lfs_config *c, lfs_block_t block) {
    (void)c;
    uint32_t addr = FS_BASE_OFFSET + (block * BLOCK_SIZE_BYTES);
    
    uint32_t ints = save_and_disable_interrupts();
    flash_range_erase(addr, BLOCK_SIZE_BYTES);
    restore_interrupts(ints);
    
    return 0;
}

int pico_sync(const struct lfs_config *c) {
    (void)c;
    return 0;
}

}
