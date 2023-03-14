const murmurhash = require('murmurhash-js');
const crypto = require('crypto');
class HSSP { // Can hold up to 64 RiB (65536 YiB, 4294967296 ZiB, ...) (insane amount of data, 11.8Gh of 4k Video (100Mbit/s))
    #files = [];
    #pwd = null;
    #idx = 0;
    constructor() {}
    get fileList() {
        return this.#files;
    }
    addFile(name, buffer, setAsIndex) {
        var pos = this.#files.push([name, buffer]);
        if (setAsIndex) this.#idx = pos;
        return pos - 1;
    }
    removeFile(position) {
        if (!this.#files[position]) return null;
        if (this.#idx == position) this.#idx = 0;
        return this.#files.splice(position, 1)[0];
    }
    addFolder(name) {
        return this.#files.push(['//' + name, Buffer.from([])]);
    }
    removeFolder(position) {
        return this.#files.splice(position, 1)[0][0];
    }
    importFromHSSP(buffer, password) {
        const inp = buffer.subarray(64, buffer.byteLength);
        const hash = murmurhash.murmur3(inp.toString('utf8'), 0x31082007);
        if (buffer.readUint32LE(4) !== hash) return false;
        const fileCount = buffer.readUint32LE(8);
        if (!buffer.subarray(12, 60).equals(Buffer.alloc(48).fill(0))) { // check if file is encrypted
            if (crypto.createHash('sha256').update(crypto.createHash('sha256').update(password).digest()).digest().toString('base64') !== buffer.subarray(12, 44).toString('base64')) return false;
            const iv = buffer.subarray(44, 60);
            const encrypted = buffer.subarray(64, buffer.byteLength);
            const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.createHash('sha256').update(password).digest(), iv);
            const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            decrypted.copy(buffer, 64);
        };

        var offs = 64;
        for (var i = 0; i < fileCount; i++) {
            const nameLen = buffer.readUint16LE(offs + 8);
            const name = buffer.subarray(offs + 10, offs + 10 + nameLen).toString('utf8');
            const fileSize = Number(buffer.readBigUint64LE(offs));
            this.#files.push([name, buffer.subarray(offs + 10 + nameLen, offs + 10 + nameLen + fileSize)]);
            offs += 10 + nameLen * 2 + fileSize;
        };
        return true;
    }
    toBuffer() {
        var size = 64; // Bytes
        this.#files.forEach(file => {
            size += 10 + (new TextEncoder().encode(file[0])).byteLength + (new TextEncoder().encode(file[0])).byteLength + file[1].byteLength; // (FileSize + NameLength) + FileName + File
        });
        const out = Buffer.alloc(size);
        out.write('HSSP', 0, 'utf8'); // Magic value :) | 4+0
        out.writeUint32LE(this.#files.length, 8); // File count | 4+8
        for (var i = 3; i < 11; i++) {
            out.writeUint32LE(0, i * 4); // Password hash, if not set = 0 | 32+12
            // 12 - 44
        };
        for (var i = 0; i < 4; i++) {
            out.writeUint32LE(0, i * 4 + 44); // Encryption initialization vector (iv), if not set = 0 | 16+44
            // 44 - 60
        };
        out.writeUint32LE(this.#idx, 60); // Index file number, 0 if not set | 4+60
        var offs = 128; // Start
        this.#files.forEach(file => {
            out.writeBigUint64LE(BigInt(file[1].byteLength), offs); // file size (up to 16 EiB!!!)
            out.writeUint16LE((new TextEncoder().encode(file[0])).byteLength, offs + 8); // name size
            out.write(file[0], offs + 10, 'utf8'); // name
            file[1].copy(out, offs + 10 + (new TextEncoder().encode(file[0])).byteLength); // file
            offs += 10 + (new TextEncoder().encode(file[0])).byteLength + (new TextEncoder().encode(file[0])).byteLength + file[1].byteLength;
        });
        const pack = out.subarray(128, size);
        if (this.#pwd !== null) {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', crypto.createHash('sha256').update(this.#pwd).digest(), iv);
            const encrypted = Buffer.concat([cipher.update(pack), cipher.final()]);
            iv.copy(out, 44);
            encrypted.copy(out, 128);
            crypto.createHash('sha256').update(crypto.createHash('sha256').update(this.#pwd).digest()).digest().copy(out, 12);
            const eOut = Buffer.concat([out.subarray(0, 128), encrypted]);
            eOut.writeUint32LE(murmurhash.murmur3(encrypted.toString('utf8'), 0x31082007), 4);
            return eOut;
        };
        out.writeUint32LE(murmurhash.murmur3(pack.toString('utf8'), 0x31082007), 4); // checksum
        return out;
    }
    setPassword(string) {
        this.#pwd = string;
    }
    removePassword() {
        this.#pwd = null;
    }
};
module.exports = HSSP; // HugeSizeSupportingPackage
