// SPA 404 回退（避免重新整理 404）
const fs = require('fs');
const path = require('path');

try {
  const source = path.join(__dirname, '../dist/index.html');
  const target = path.join(__dirname, '../dist/404.html');
  fs.copyFileSync(source, target);
  console.log('✓ Copied index.html -> 404.html for SPA fallback');
} catch (e) {
  console.error('✗ Create 404.html failed:', e);
  process.exit(1);
}
