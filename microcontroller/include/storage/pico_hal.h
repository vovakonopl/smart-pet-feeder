#pragma once

#include "lfs.h"

// Configuration for LittleFS on Pico
namespace storage {
    int pico_read(const struct lfs_config *c, lfs_block_t block, lfs_off_t off, void *buffer, lfs_size_t size);
    int pico_prog(const struct lfs_config *c, lfs_block_t block, lfs_off_t off, const void *buffer, lfs_size_t size);
    int pico_erase(const struct lfs_config *c, lfs_block_t block);
    int pico_sync(const struct lfs_config *c);

    // Global FS instance and config
    extern lfs_t lfs;
    extern struct lfs_config cfg;
}
