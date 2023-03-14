# HSSP - Huge Size Supporting Package

Can hold up to 64 RiB = 65536 YiB = 4294967296 ZiB (insane amount of data).

This file can hold 11.8 billion hours of 4k Video at 100 Mbit/s.

---
## File Structure

All data is low endian.

### Header
| Starting byte | Size in bytes | Content                                                                    |
|:-------------:|:-------------:|----------------------------------------------------------------------------|
|       0       |       4       | UTF-8 string "HSSP"                                                        |
|       4       |       4       | MurmurHash3 (32 bit) checksum of the file content from byte 64 till end    |
|       8       |       4       | Uint32: number of files/folders included                                   |
|       12      |       32      | Password SHA-256 hash SHA-256 hash (if no password is set, it should be 0) |
|       44      |       16      | Encryption initialization vector (if no password is set, it should be 0)   |
|       60      |       4       | Index file position (if not set, 0)                                        |

### Content



to be continued...
