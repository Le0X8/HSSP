# HSSP - Huge Size Supporting Package

Can hold up to 64 RiB = 65536 YiB = 4294967296 ZiB (insane amount of data).

This file can hold 11.8 billion hours of 4k Video at 100 Mbit/s.

---
## File Structure

All data is low endian.

Starting byte | Size in Bytes | Content
---
0 | 4 | UTF-8 string "HSSP".
4 | 4 | MurmurHash3 (32 bit) of the file from byte 64 till end.
8 | 4 | Contains a Uint32 with the number of the files inside the file.
