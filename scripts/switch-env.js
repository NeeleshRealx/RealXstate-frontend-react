#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];

const envFile = path.join(__dirname, '..', '.env-mode');

function readCurrentEnv() {
  try {
    return fs.readFileSync(envFile, 'utf8').trim();
  } catch (error) {
    return 'dev';
  }
}

function writeEnv(env) {
  fs.writeFileSync(envFile, env);
  console.log(`✅ Environment switched to: ${env.toUpperCase()}`);
}

function showStatus() {
  const currentEnv = readCurrentEnv();
  console.log(`Current environment: ${currentEnv.toUpperCase()}`);
}

switch (command) {
  case 'dev':
    writeEnv('dev');
    break;
  case 'prod':
    writeEnv('prod');
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('Usage: npm run env:dev | npm run env:prod | npm run env:status');
    console.log('Available commands:');
    console.log('  env:dev    - Switch to development environment');
    console.log('  env:prod   - Switch to production environment');
    console.log('  env:status - Show current environment');
    break;
}
