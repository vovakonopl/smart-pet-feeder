#include "storage/utils.h"
#include "storage/pico_hal.h"
#include <cstring>
#include <string>

// Buffers for LittleFS
static uint8_t read_buffer[256];
static uint8_t prog_buffer[256];
static uint8_t lookahead_buffer[16];

namespace storage {
    bool mountFS() {
        static bool mounted = false;
        if (mounted) return true;

        // Config setup
        cfg.read = pico_read;
        cfg.prog = pico_prog;
        cfg.erase = pico_erase;
        cfg.sync = pico_sync;
        cfg.read_size = 1;
        cfg.prog_size = 256;
        cfg.block_size = 4096;
        cfg.block_count = (512 * 1024) / 4096; // 128 blocks
        cfg.cache_size = 256;
        cfg.lookahead_size = 16;
        cfg.block_cycles = 500;
        
        cfg.read_buffer = read_buffer;
        cfg.prog_buffer = prog_buffer;
        cfg.lookahead_buffer = lookahead_buffer;

        // Try to mount
        int err = lfs_mount(&lfs, &cfg);
        if (err) {
            // Reformat if mount fails
            lfs_format(&lfs, &cfg);
            err = lfs_mount(&lfs, &cfg);
        }

        if (err) return false;

        mounted = true;
        return true;
    }

    // write in temporary file and then rename it on success
    bool atomicWriteJson(const char *path, const JsonDocument &doc) {
        std::string tmpPath = std::string(path) + ".tmp";

        lfs_file_t file;
        int err = lfs_file_open(&lfs, &file, tmpPath.c_str(), LFS_O_WRONLY | LFS_O_CREAT | LFS_O_TRUNC);
        if (err) return false;

        std::string jsonStr;
        serializeJson(doc, jsonStr);

        err = lfs_file_write(&lfs, &file, jsonStr.c_str(), jsonStr.length());
        lfs_file_close(&lfs, &file);

        if (err < 0) {
            lfs_remove(&lfs, tmpPath.c_str());
            return false;
        }

        // rename template and replace old file if there is one
        err = lfs_rename(&lfs, tmpPath.c_str(), path);
        if (err) {
            lfs_remove(&lfs, tmpPath.c_str());
            return false;
        }

        return true;
    }
}
