const fs = require('fs');
const path = require('path');

// Helper to write file
function writeTs(fileName, varName, list) {
  const filePath = path.join(__dirname, '..', 'lib', 'data', fileName);
  const content = `import type { University } from "@/types/university";\n\nexport const ${varName}: University[] = ${JSON.stringify(list, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Generated ${fileName} with ${list.length} institutions.`);
}

console.log('Building 600 scaled universities generator script...');

