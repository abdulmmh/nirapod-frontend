const fs = require('node:fs');
const value = process.env.NIRAPOD_API_URL || '';
if (value && (!value.startsWith('https://') || !value.endsWith('/api'))) throw new Error('NIRAPOD_API_URL must be an HTTPS URL ending in /api');
const config = { demoMode: process.env.NIRAPOD_DEMO_MODE !== 'false' };
if (value) config.apiUrl = value;
if (process.env.NIRAPOD_DEMO_PASSWORD) config.demoPassword = process.env.NIRAPOD_DEMO_PASSWORD;
fs.writeFileSync('src/assets/runtime-config.js', 'window.nirapodConfig = ' + JSON.stringify(config) + ';\n');