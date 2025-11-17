// scripts/generate-timestamp.js
import { writeFileSync } from 'fs';
const timestamp = new Date().toISOString();
writeFileSync(
  'src/environments/build-timestamp.ts',
  `export const BUILD_TIMESTAMP = '${timestamp}';\n`
);
