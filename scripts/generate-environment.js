// scripts/generate-timestamp.js
import { writeFileSync } from 'fs';
const timestamp = new Date().toISOString();
writeFileSync(
  'src/environments/environment.production.ts',
  `export const environment = { buildTimestamp : '${timestamp}' };\n`
);
