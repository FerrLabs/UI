#!/usr/bin/env node
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..', 'src');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function exists(p) {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

function resolveSpecifier(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  if (exists(base + '.ts')) return spec + '.js';
  if (exists(base + '.tsx')) return spec + '.js';
  if (exists(base) && statSync(base).isDirectory()) {
    if (exists(join(base, 'index.ts')) || exists(join(base, 'index.tsx'))) {
      const sep = spec.endsWith('/') ? '' : '/';
      return spec + sep + 'index.js';
    }
  }
  return null;
}

const RE =
  /(from\s+['"]|import\s*\(\s*['"]|export\s+\*\s+from\s+['"]|export\s+\{[^}]*\}\s+from\s+['"])(\.\.?\/[^'"]+)(['"])/g;

let totalFiles = 0;
let totalEdits = 0;
const unresolved = [];

for (const file of walk(SRC)) {
  const src = readFileSync(file, 'utf8');
  let edits = 0;
  const out = src.replace(RE, (full, head, spec, tail) => {
    if (/\.(js|mjs|cjs|json|css)$/.test(spec)) return full;
    const resolved = resolveSpecifier(file, spec);
    if (!resolved) {
      unresolved.push({ file: relative(SRC, file), spec });
      return full;
    }
    edits++;
    return head + resolved + tail;
  });
  if (edits > 0) {
    writeFileSync(file, out);
    totalFiles++;
    totalEdits += edits;
  }
}

console.log(`Rewrote ${totalEdits} imports across ${totalFiles} files.`);
if (unresolved.length > 0) {
  console.log(`\n${unresolved.length} UNRESOLVED:`);
  for (const u of unresolved) console.log(`  ${u.file}: ${u.spec}`);
  process.exit(1);
}
