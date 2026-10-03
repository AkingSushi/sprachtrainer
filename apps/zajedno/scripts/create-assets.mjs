import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';

const output = new URL('../public/', import.meta.url);
await mkdir(output, { recursive: true });

function canvas(width, height, background) {
  const image = new PNG({ width, height });
  const pixel = (column, row, color) => {
    if (column < 0 || row < 0 || column >= width || row >= height) return;
    const offset = (Math.floor(row) * width + Math.floor(column)) * 4;
    image.data[offset] = color[0]; image.data[offset + 1] = color[1]; image.data[offset + 2] = color[2]; image.data[offset + 3] = color[3] ?? 255;
  };
  const rect = (left, top, sizeX, sizeY, color) => {
    for (let row = top; row < top + sizeY; row += 1) for (let column = left; column < left + sizeX; column += 1) pixel(column, row, color);
  };
  const ellipse = (centerX, centerY, radiusX, radiusY, color) => {
    for (let row = Math.floor(centerY - radiusY); row <= centerY + radiusY; row += 1)
      for (let column = Math.floor(centerX - radiusX); column <= centerX + radiusX; column += 1)
        if (((column - centerX) / radiusX) ** 2 + ((row - centerY) / radiusY) ** 2 <= 1) pixel(column, row, color);
  };
  const polygon = (points, color) => {
    for (let row = 0; row < height; row += 1) for (let column = 0; column < width; column += 1) {
      let inside = false;
      for (let index = 0, previous = points.length - 1; index < points.length; previous = index++) {
        const [firstX, firstY] = points[index]; const [secondX, secondY] = points[previous];
        if ((firstY > row) !== (secondY > row) && column < (secondX - firstX) * (row - firstY) / (secondY - firstY) + firstX) inside = !inside;
      }
      if (inside) pixel(column, row, color);
    }
  };
  rect(0, 0, width, height, background);
  return { image, rect, ellipse, polygon };
}

const green = [34, 92, 72];
const paper = [245, 248, 245];
const coral = [199, 100, 80];
const light = [219, 234, 222];
const scene = canvas(720, 270, paper);
scene.rect(460, 18, 158, 174, [211, 229, 230]);
scene.rect(470, 28, 138, 150, [234, 243, 241]);
scene.rect(535, 28, 8, 150, paper);
scene.rect(470, 94, 138, 8, paper);
scene.rect(78, 206, 580, 12, [130, 159, 134]);
scene.polygon([[93, 218], [647, 218], [668, 242], [70, 242]], [220, 233, 218]);
scene.rect(570, 105, 5, 79, green);
scene.ellipse(555, 120, 23, 10, [99, 140, 105]);
scene.ellipse(590, 100, 22, 11, green);
scene.ellipse(555, 85, 20, 11, [116, 158, 117]);
scene.polygon([[544, 161], [602, 161], [594, 206], [552, 206]], coral);
scene.rect(539, 158, 68, 10, [178, 80, 63]);
scene.ellipse(203, 209, 90, 9, [207, 223, 204]);
scene.ellipse(420, 209, 86, 9, [207, 223, 204]);
function mug(center, top, color) {
  scene.ellipse(center + 51, top + 34, 29, 30, color);
  scene.ellipse(center + 51, top + 34, 17, 19, paper);
  scene.rect(center - 50, top, 100, 58, color);
  scene.ellipse(center, top + 57, 50, 15, color);
  scene.ellipse(center, top, 50, 13, color);
  scene.ellipse(center, top, 41, 8, [245, 229, 195]);
  scene.ellipse(center, top + 1, 36, 5, [107, 84, 62]);
  scene.rect(center - 36, top + 17, 5, 31, [255, 255, 255, 120]);
}
mug(197, 130, green);
mug(402, 133, coral);
scene.polygon([[269, 204], [314, 194], [343, 204], [343, 224], [313, 214], [269, 224]], [252, 253, 250]);
scene.polygon([[267, 223], [313, 213], [345, 223], [345, 228], [313, 218], [267, 228]], [86, 126, 143]);
scene.rect(312, 200, 2, 16, [190, 209, 196]);
await writeFile(new URL('table-for-two.png', output), PNG.sync.write(scene.image));

const icon = canvas(256, 256, green);
icon.rect(41, 55, 123, 87, [246, 250, 242]);
icon.polygon([[58, 135], [58, 169], [100, 137]], [246, 250, 242]);
icon.rect(101, 115, 113, 79, [234, 152, 126]);
icon.polygon([[198, 186], [198, 219], [161, 186]], [234, 152, 126]);
icon.rect(61, 79, 69, 8, green);
icon.rect(61, 98, 47, 8, green);
icon.rect(122, 139, 68, 8, green);
icon.rect(122, 159, 43, 8, green);
const iconPng = PNG.sync.write(icon.image);
await writeFile(new URL('zajedno.png', output), iconPng);
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(1, 2); icoHeader.writeUInt16LE(1, 4);
icoHeader.writeUInt16LE(1, 10); icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(iconPng.length, 14); icoHeader.writeUInt32LE(22, 18);
await writeFile(new URL('zajedno.ico', output), Buffer.concat([icoHeader, iconPng]));
console.log('Created local PNG illustration, PNG app mark and Windows ICO.');