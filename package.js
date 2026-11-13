const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const outputFilename = 'scorm-quiz-package.zip';
const filesToInclude = ['imsmanifest.xml', 'index.html', 'styles.css', 'script.js', 'logic.js'];

// Precomputed CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files, outPath) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn(`Warning: Required file missing -> ${file}`);
      continue;
    }

    const rawData = fs.readFileSync(file);
    const compressedData = zlib.deflateRawSync(rawData);
    const fileCrc = crc32(rawData);
    const nameBuf = Buffer.from(path.basename(file), 'utf8');

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4);         // Version needed (2.0)
    localHeader.writeUInt16LE(0, 6);          // General purpose bit flag
    localHeader.writeUInt16LE(8, 8);          // Compression method (8 = Deflate)
    localHeader.writeUInt16LE(0, 10);         // Last mod file time
    localHeader.writeUInt16LE(0, 12);         // Last mod file date
    localHeader.writeUInt32LE(fileCrc, 14);   // CRC-32
    localHeader.writeUInt32LE(compressedData.length, 18); // Compressed size
    localHeader.writeUInt32LE(rawData.length, 22);        // Uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);        // File name length
    localHeader.writeUInt16LE(0, 28);                     // Extra field length

    localParts.push(localHeader, nameBuf, compressedData);

    // Central directory file header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Signature
    centralHeader.writeUInt16LE(20, 4);         // Version made by
    centralHeader.writeUInt16LE(20, 6);         // Version needed
    centralHeader.writeUInt16LE(0, 8);          // Bit flag
    centralHeader.writeUInt16LE(8, 10);         // Compression method
    centralHeader.writeUInt16LE(0, 12);         // Last mod time
    centralHeader.writeUInt16LE(0, 14);         // Last mod date
    centralHeader.writeUInt32LE(fileCrc, 16);   // CRC-32
    centralHeader.writeUInt32LE(compressedData.length, 20); // Compressed size
    centralHeader.writeUInt32LE(rawData.length, 24);        // Uncompressed size
    centralHeader.writeUInt16LE(nameBuf.length, 28);        // File name length
    centralHeader.writeUInt16LE(0, 30);                     // Extra field length
    centralHeader.writeUInt16LE(0, 32);                     // File comment length
    centralHeader.writeUInt16LE(0, 34);                     // Disk number start
    centralHeader.writeUInt16LE(0, 36);                     // Internal file attributes
    centralHeader.writeUInt32LE(0, 38);                     // External file attributes
    centralHeader.writeUInt32LE(offset, 42);                // Relative offset of local header

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressedData.length;

    console.log(`Added to package: ${file}`);
  }

  const centralDirBuffer = Buffer.concat(centralParts);
  const entryCount = centralParts.length / 2;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);               // Signature
  eocd.writeUInt16LE(0, 4);                        // Number of this disk
  eocd.writeUInt16LE(0, 6);                        // Disk where central directory starts
  eocd.writeUInt16LE(entryCount, 8);               // Number of central directory records on this disk
  eocd.writeUInt16LE(entryCount, 10);              // Total number of central directory records
  eocd.writeUInt32LE(centralDirBuffer.length, 12); // Size of central directory
  eocd.writeUInt32LE(offset, 16);                  // Offset of start of central directory
  eocd.writeUInt16LE(0, 20);                       // Comment length

  const finalBuffer = Buffer.concat([...localParts, centralDirBuffer, eocd]);
  fs.writeFileSync(outPath, finalBuffer);
  console.log(`\nSuccess! LMS-ready package generated: ${path.resolve(outPath)}`);
}

createZip(filesToInclude, outputFilename);
