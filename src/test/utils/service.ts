import path from 'path';
import fs from 'fs';

function getPricingFile(){
  const filePath = path.resolve(__dirname, '../data/pricings/zoom-2025.yml');
  if (fs.existsSync(filePath)) {
    return filePath;
  } else {
    throw new Error(`File not found at ${filePath}`);
  }
}

export {getPricingFile};