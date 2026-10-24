// Combine les PNG générés en un fichier .ico valide (format moderne : entrées compressées PNG).
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 64, 128, 256];
const dir = __dirname;
const images = sizes.map((s) => fs.readFileSync(path.join(dir, `icon-${s}.png`)));

const headerSize = 6;
const dirEntrySize = 16;
let offset = headerSize + dirEntrySize * images.length;

const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4); // count

const dirEntries = [];
images.forEach((img, i) => {
	const size = sizes[i];
	const entry = Buffer.alloc(dirEntrySize);
	entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
	entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
	entry.writeUInt8(0, 2); // color palette
	entry.writeUInt8(0, 3); // reserved
	entry.writeUInt16LE(1, 4); // color planes
	entry.writeUInt16LE(32, 6); // bits per pixel
	entry.writeUInt32LE(img.length, 8); // size of image data
	entry.writeUInt32LE(offset, 12); // offset of image data
	offset += img.length;
	dirEntries.push(entry);
});

const ico = Buffer.concat([header, ...dirEntries, ...images]);
fs.writeFileSync(path.join(dir, 'icon.ico'), ico);
console.log('icon.ico écrit, taille:', ico.length, 'octets');
