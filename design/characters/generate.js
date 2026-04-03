const fs = require('fs');

const PIXEL = 16;

function generateSVG(name, pixels, palette, bgColor = '#1a1a2e') {
  const height = pixels.length;
  const width = Math.max(...pixels.map(r => r.length));
  const svgW = width * PIXEL + PIXEL * 4; // padding
  const svgH = height * PIXEL + PIXEL * 4;
  const offsetX = PIXEL * 2;
  const offsetY = PIXEL * 2;

  let rects = '';
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      const val = pixels[y][x];
      if (val === 0) continue;
      const color = palette[val];
      if (!color) continue;
      rects += `  <rect x="${offsetX + x * PIXEL}" y="${offsetY + y * PIXEL}" width="${PIXEL}" height="${PIXEL}" fill="${color}"/>\n`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">
  <rect width="${svgW}" height="${svgH}" fill="${bgColor}" rx="8"/>
${rects}</svg>`;

  fs.writeFileSync(`${__dirname}/${name}.svg`, svg);
  console.log(`Created ${name}.svg (${svgW}x${svgH})`);
}

// ========================================
// 코부장 (Ko Bujang) - Claude/Orange
// Blocky cat-bear creature with small ears
// Senior, warm, dependable
// ========================================
const kobujang_palette = {
  1: '#D4764E', // main orange
  2: '#B5573A', // dark orange (shadow)
  3: '#2D1B12', // very dark (outline/eyes)
  4: '#E8A07A', // light orange (highlight)
  5: '#C0392B', // red (tie accent)
  6: '#FFFFFF', // white (eye glint)
};

// 14 wide × 16 tall
const kobujang_pixels = [
  [0,0,0,1,1,0,0,0,0,0,1,1,0,0],  // ears
  [0,0,1,1,1,0,0,0,0,1,1,1,0,0],  // ears
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0],  // head top
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0],  // head
  [0,1,1,4,4,1,1,1,1,4,4,1,1,0],  // head (cheeks highlight)
  [0,1,1,3,3,1,1,1,1,3,3,1,1,0],  // eyes
  [0,1,1,3,6,1,1,1,1,3,6,1,1,0],  // eyes with glint
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0],  // face
  [0,1,1,1,1,1,3,3,1,1,1,1,1,0],  // nose
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0],  // chin
  [0,0,0,2,1,1,5,1,1,1,2,0,0,0],  // body top (tie)
  [0,0,0,2,1,1,5,1,1,1,2,0,0,0],  // body (tie)
  [0,0,0,2,1,1,1,1,1,1,2,0,0,0],  // body
  [0,0,0,2,1,1,1,1,1,1,2,0,0,0],  // body bottom
  [0,0,0,0,1,1,0,0,1,1,0,0,0,0],  // legs
  [0,0,0,0,2,2,0,0,2,2,0,0,0,0],  // feet
];

// ========================================
// 오과장 (O Gwajang) - Codex/Green
// More angular/square, with glasses
// Mid-level, techy, analytical
// ========================================
const ogwajang_palette = {
  1: '#4CAF50', // main green
  2: '#2E7D32', // dark green (shadow)
  3: '#1B3D1E', // very dark (outline/eyes)
  4: '#81C784', // light green (highlight)
  5: '#FFFFFF', // white (glasses/eye glint)
  6: '#FFD54F', // yellow (glasses frame)
};

// 14 wide × 15 tall
const ogwajang_pixels = [
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0],  // head top (flat, no ears)
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0],  // head
  [0,1,1,1,4,4,1,1,4,4,1,1,1,0],  // head
  [0,1,6,6,6,6,1,6,6,6,6,1,1,0],  // glasses top
  [0,1,6,3,5,6,1,6,3,5,6,1,1,0],  // eyes in glasses
  [0,1,6,6,6,6,6,6,6,6,6,1,1,0],  // glasses bottom (connected)
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0],  // face
  [0,0,1,1,1,3,3,3,1,1,1,1,0,0],  // mouth
  [0,0,0,2,1,1,1,1,1,1,2,0,0,0],  // body top
  [0,0,0,2,1,1,1,1,1,1,2,0,0,0],  // body
  [0,0,0,2,1,4,1,1,4,1,2,0,0,0],  // body (buttons)
  [0,0,0,2,1,1,1,1,1,1,2,0,0,0],  // body bottom
  [0,0,0,0,1,1,0,0,1,1,0,0,0,0],  // legs
  [0,0,0,0,2,2,0,0,2,2,0,0,0,0],  // feet
];

// ========================================
// 젬대리 (Jem Daeri) - Gemini/Blue
// Rounder, smaller, sparkle on head
// Junior, energetic, curious
// ========================================
const jemdaeri_palette = {
  1: '#5C6BC0', // main indigo/blue
  2: '#3949AB', // dark blue (shadow)
  3: '#1A237E', // very dark (outline/eyes)
  4: '#9FA8DA', // light blue (highlight)
  5: '#FFFFFF', // white (eye glint/sparkle)
  6: '#FFD54F', // yellow (star/sparkle)
};

// 14 wide × 16 tall
const jemdaeri_pixels = [
  [0,0,0,0,0,0,6,0,0,0,0,0,0,0],  // sparkle top
  [0,0,0,0,0,6,6,6,0,0,0,0,0,0],  // sparkle
  [0,0,0,0,0,0,6,0,0,0,0,0,0,0],  // sparkle bottom
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0],  // head top (rounder, smaller)
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0],  // head
  [0,0,1,1,4,4,1,1,4,4,1,1,0,0],  // head
  [0,0,1,1,3,5,1,1,3,5,1,1,0,0],  // big cute eyes
  [0,0,1,1,3,3,1,1,3,3,1,1,0,0],  // eyes bottom
  [0,0,1,1,1,1,1,1,1,1,1,1,0,0],  // face
  [0,0,0,1,1,1,3,1,1,1,1,0,0,0],  // mouth (small smile)
  [0,0,0,0,2,1,1,1,1,2,0,0,0,0],  // body (thinner)
  [0,0,0,0,2,1,4,4,1,2,0,0,0,0],  // body
  [0,0,0,0,2,1,1,1,1,2,0,0,0,0],  // body bottom
  [0,0,0,0,0,1,0,0,1,0,0,0,0,0],  // legs (thinner)
  [0,0,0,0,0,2,0,0,2,0,0,0,0,0],  // feet
];

generateSVG('kobujang', kobujang_pixels, kobujang_palette);
generateSVG('ogwajang', ogwajang_pixels, ogwajang_palette);
generateSVG('jemdaeri', jemdaeri_pixels, jemdaeri_palette);

console.log('\nDone! All characters generated.');
