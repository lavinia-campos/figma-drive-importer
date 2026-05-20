// Run once before loading the plugin in Figma: node build.js
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'ui.html'), 'utf8');
const src = fs.readFileSync(path.join(__dirname, 'code.src.js'), 'utf8');

const output = src.replace('__html__', JSON.stringify(html));
fs.writeFileSync(path.join(__dirname, 'code.js'), output);

console.log('✓ Built code.js — ready to load in Figma.');
