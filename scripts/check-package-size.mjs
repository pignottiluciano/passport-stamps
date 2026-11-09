import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const budgets = { tarball: 350 * 1024, initialCore: 24 * 1024, svg: 10 * 1024 };
const [, , archive] = process.argv;
if (!archive) throw new Error('Usage: node scripts/check-package-size.mjs <npm-package.tgz>');
const tarball = resolve(archive);
const directory = mkdtempSync(join(tmpdir(), 'passport-stamps-size-'));
const packageRoot = join(directory, 'package');
const failures = [];

function listFiles(path, excludedDirectory) {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const child = join(path, entry.name);
    if (child === excludedDirectory) return [];
    if (entry.isDirectory()) return listFiles(child, excludedDirectory);
    return entry.isFile() ? [child] : [];
  });
}

function check(label, measured, limit) {
  const message = `${label}: ${measured.toLocaleString('en')} B (limit ${limit.toLocaleString('en')} B)`;
  if (measured > limit) failures.push(message);
  else console.log(message);
}

try {
  check(archive, statSync(tarball).size, budgets.tarball);
  execFileSync('tar', ['-xzf', tarball, '-C', directory], { stdio: 'inherit' });
  const core = join(packageRoot, 'dist', 'core');
  const modules = listFiles(core, join(core, 'art')).filter(file => /\.m?js$/.test(file));
  if (!modules.includes(join(core, 'index.js'))) throw new Error('The archive is missing dist/core/index.js');
  const initialCoreBytes = modules.reduce((total, file) => total + gzipSync(readFileSync(file)).length, 0);
  check('dist/core shared JavaScript (gzip, excluding lazy artwork)', initialCoreBytes, budgets.initialCore);

  const svgFiles = listFiles(join(packageRoot, 'svg')).filter(file => file.endsWith('.svg'));
  if (svgFiles.length === 0) throw new Error('The archive does not contain SVG files');
  let largest = { file: '', size: 0 };
  for (const file of svgFiles) {
    const size = statSync(file).size;
    const path = relative(packageRoot, file);
    if (size > budgets.svg) failures.push(`${path}: ${size} B (limit ${budgets.svg} B)`);
    if (size > largest.size) largest = { file: path, size };
  }
  console.log(`${svgFiles.length} SVGs checked. Largest: ${largest.file}, ${largest.size} B (limit ${budgets.svg} B).`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error('Size budget exceeded\n' + failures.join('\n'));
  process.exitCode = 1;
}
