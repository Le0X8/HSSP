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
|       4       |       4       | MurmurHash3 (32 bit) checksum of the file content from byte 64 till end (Seed: `0x31082007`)    |
|       8       |       4       | Uint32: number of files/folders included                                   |
|       12      |       32      | Password SHA-256 hash SHA-256 hash (if no password is set, it should be 0) |
|       44      |       16      | Encryption initialization vector (if no password is set, it should be 0)   |
|       60      |       4       | Index file position (if not set, 0)                                        |

### Content

The content is a list without separators, containing files.

### Content > File

| Starting byte | Size in bytes | Content                                                                      |
|:-------------:|:-------------:|------------------------------------------------------------------------------|
|       0       |       8       | BigUint64 of the file byte length (=b)                                       |
|       8       |       2       | Uint16 of the file name (UTF-8) byte length (=a)                             |
|       10      |       a       | File name (UTF-8) (if starting with //, it will be declared as empty folder) |
|     10 + a    |       b       | File content                                                                 |

### Encryption
1. Generate 16 random bytes, save them at byte 44. Ihis is your initialization vector (iv).
2. Create an AES-256-CBC cipher of your password SHA-256 hash and your iv.
3. Update the HSSP content with the cipher and its final bytes (maybe you have to adjust the file size).
4. Hash the passwords SHA-256 again with SHA-256 and save the hashed hash at byte 12.
5. Update the Murmur3 hash of the encrypted file content with the seed `0x31082007`.

### Decryption
1. Firstly, ensure that bytes 12-60 are not filled with 0.
2. Check if the given password is correct, by hashing the password wirh the SHA-256 algorithm two times.
3. Fetch the iv from bytes 44-60.
4. With the password hashed one time with SHA-256 and the iv, decrypt the content from byte 64 till the end of the file.
5. The original contents of the file are now the decrypted data from step 4 and the final deciphered bytes.

---
## Parsing & editing code examples

- [Node.JS](https://github.com/Le0X8/HSSP/tree/nodejs)
