#!/usr/bin/env node
/**
 * Fixes the Next.js standalone build structure for OpenNext compatibility.
 *
 * Next.js creates: .next/standalone/Sites/payload-d1/.next/
 * OpenNext expects: .next/standalone/.next/
 *
 * This script moves the nested structure to the expected location.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const standalonePath = path.join(projectRoot, '.next', 'standalone');
const nestedPath = path.join(standalonePath, 'Sites', 'payload-d1');

// Check if the nested structure exists
if (!fs.existsSync(nestedPath)) {
  console.log('✅ Standalone structure is already correct');
  process.exit(0);
}

console.log('🔧 Fixing standalone build structure...');

// Move contents from nested directory to standalone root
const itemsToMove = ['.next', 'node_modules', 'package.json', 'server.js', 'src', '.env'];

for (const item of itemsToMove) {
  const sourcePath = path.join(nestedPath, item);
  const targetPath = path.join(standalonePath, item);

  if (fs.existsSync(sourcePath)) {
    // Remove target if it exists
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }

    // Move the item
    fs.renameSync(sourcePath, targetPath);
    console.log(`  ✓ Moved ${item}`);
  }
}

// Clean up empty nested directories
fs.rmSync(path.join(standalonePath, 'Sites'), { recursive: true, force: true });

console.log('✅ Standalone structure fixed');
