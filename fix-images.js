const fs = require('fs');
const path = './src/data/products.ts';
let content = fs.readFileSync(path, 'utf8');

const parts = content.split(/(?=id: ")/);
let currentId = null;
let imgCounter = 0;

const fixed = parts.map(part => {
  const idMatch = part.match(/id: "([^"]+)"/);
  if (idMatch) {
    currentId = idMatch[1];
    imgCounter = 0;
  }
  return part.replace(/https:\/\/images\.unsplash\.com\/photo-[^"]*/g, () => {
    imgCounter++;
    return `https://picsum.photos/seed/${currentId}-${imgCounter}/800/600`;
  });
}).join('');

fs.writeFileSync(path, fixed, 'utf8');
console.log('Done — all product image URLs replaced with reliable Picsum placeholders.');