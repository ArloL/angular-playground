// scripts/generate-timestamp.js
const { writeFileSync } = require('fs');
const timestamp = new Date().toISOString();
writeFileSync(
  'src/environments/environment.production.ts',
  `export const environment = { buildTimestamp : '${timestamp}' };\n`
);
