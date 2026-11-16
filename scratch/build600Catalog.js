const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'lib', 'data');

const PALETTES = [
  { primary: '#7E1B1B', glow: 'rgba(126,27,27,0.30)', border: 'rgba(126,27,27,0.55)', bgTint: 'rgba(126,27,27,0.12)' },
  { primary: '#991B1B', glow: 'rgba(153,27,27,0.30)', border: 'rgba(153,27,27,0.55)', bgTint: 'rgba(153,27,27,0.12)' },
  { primary: '#1E3A8A', glow: 'rgba(30,58,138,0.30)', border: 'rgba(30,58,138,0.55)', bgTint: 'rgba(30,58,138,0.12)' },
  { primary: '#0F766E', glow: 'rgba(15,118,110,0.30)', border: 'rgba(15,118,110,0.55)', bgTint: 'rgba(15,118,110,0.12)' },
  { primary: '#0369A1', glow: 'rgba(3,105,161,0.30)', border: 'rgba(3,105,161,0.55)', bgTint: 'rgba(3,105,161,0.12)' },
  { primary: '#047857', glow: 'rgba(4,120,87,0.30)', border: 'rgba(4,120,87,0.55)', bgTint: 'rgba(4,120,87,0.12)' },
  { primary: '#B45309', glow: 'rgba(180,83,9,0.30)', border: 'rgba(180,83,9,0.55)', bgTint: 'rgba(180,83,9,0.12)' },
  { primary: '#4338CA', glow: 'rgba(67,56,202,0.30)', border: 'rgba(67,56,202,0.55)', bgTint: 'rgba(67,56,202,0.12)' },
  { primary: '#1D4ED8', glow: 'rgba(29,78,216,0.30)', border: 'rgba(29,78,216,0.55)', bgTint: 'rgba(29,78,216,0.12)' },
  { primary: '#059669', glow: 'rgba(5,150,105,0.30)', border: 'rgba(5,150,105,0.55)', bgTint: 'rgba(5,150,105,0.12)' },
  { primary: '#D97706', glow: 'rgba(217,119,6,0.30)', border: 'rgba(217,119,6,0.55)', bgTint: 'rgba(217,119,6,0.12)' },
  { primary: '#BE123C', glow: 'rgba(190,18,60,0.30)', border: 'rgba(190,18,60,0.55)', bgTint: 'rgba(190,18,60,0.12)' },
  { primary: '#4F46E5', glow: 'rgba(79,70,229,0.30)', border: 'rgba(79,70,229,0.55)', bgTint: 'rgba(79,70,229,0.12)' },
  { primary: '#2563EB', glow: 'rgba(37,99,235,0.30)', border: 'rgba(37,99,235,0.55)', bgTint: 'rgba(37,99,235,0.12)' },
  { primary: '#A31F34', glow: 'rgba(163,31,52,0.30)', border: 'rgba(163,31,52,0.55)', bgTint: 'rgba(163,31,52,0.12)' },
  { primary: '#8C1515', glow: 'rgba(140,21,21,0.30)', border: 'rgba(140,21,21,0.55)', bgTint: 'rgba(140,21,21,0.12)' },
  { primary: '#003262', glow: 'rgba(0,50,98,0.30)', border: 'rgba(0,50,98,0.55)', bgTint: 'rgba(0,50,98,0.12)' },
  { primary: '#500778', glow: 'rgba(80,7,120,0.30)', border: 'rgba(80,7,120,0.55)', bgTint: 'rgba(80,7,120,0.12)' },
];

function getPalette(i) {
  return PALETTES[i % PALETTES.length];
}

function writeTs(fileName, varName, list) {
  const filePath = path.join(dataDir, fileName);
  const content = `import type { University } from "@/types/university";\n\nexport const ${varName}: University[] = ${JSON.stringify(list, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Generated ${fileName} with ${list.length} institutions.`);
}

// Read existing datasets for India, US, UK to keep all their existing cutoffs and ranks, then inject placementMetrics
const indRaw = require('./generateUniversities.js');
console.log('Script initialized.');

