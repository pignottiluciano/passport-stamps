import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [target, tarball] = process.argv.slice(2);
const angularVersions = { 'angular-20': '20.3.35', 'angular-21': '21.2.26', 'angular-22': '22.2.5' };
const reactVersions = {
  'react-18': { version: '18.3.1', types: '18.3.31', domTypes: '18.3.7' },
  'react-19': { version: '19.3.1', types: '19.3.0', domTypes: '19.3.0' }
};
const angular = angularVersions[target];
const react = reactVersions[target];
assert.ok(tarball && (angular || react || target === 'svg'), 'Usage: node scripts/check-consumer.mjs <angular-20|angular-21|angular-22|react-18|react-19|svg> <tarball>');
const cwd = mkdtempSync(join(tmpdir(), 'passport-stamps-consumer-'));
const run = (command, args) => execFileSync(command, args, { cwd, stdio: 'inherit' });
const packageName = '@lucianopignotti/passport-stamps';

try {
  const dependencies = [resolve(tarball)];
  if (angular) {
    dependencies.push(...['common', 'compiler', 'compiler-cli', 'core', 'platform-browser'].map(name => `@angular/${name}@${angular}`));
    dependencies.push('rxjs@7.8.2', angular.startsWith('22.') ? 'typescript@6.0.3' : 'typescript@5.9.3');
  }
  if (react) {
    dependencies.push(`react@${react.version}`, `react-dom@${react.version}`, `@types/react@${react.types}`, `@types/react-dom@${react.domTypes}`);
    dependencies.push('@testing-library/react@16.3.3', 'typescript@5.9.3');
  }
  if (angular || react) dependencies.push('jsdom@27.4.0');
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  console.log(`Checking packed consumer: ${target} ${angular ?? react?.version ?? ''}`);
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--fetch-retries=1', ...dependencies]);

  if (target === 'svg') {
    assert.ok(existsSync(join(cwd, 'node_modules', packageName, 'svg', 'ar.svg')));
    assert.ok(!existsSync(join(cwd, 'node_modules', 'react')));
    assert.ok(!existsSync(join(cwd, 'node_modules', '@angular', 'core')));
  } else {
    const framework = angular ? 'angular' : 'react';
    const source = angular ? 'angular.ts' : 'react.tsx';
    for (const file of [source, 'render.mjs']) {
      copyFileSync(new URL(`../tests/consumers/${file}`, import.meta.url), join(cwd, file));
    }
    writeFileSync(join(cwd, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext',
        strict: true, skipLibCheck: true, experimentalDecorators: true, jsx: 'react-jsx',
        outDir: './dist', types: []
      },
      angularCompilerOptions: { strictTemplates: true },
      files: [source]
    }));
    run(join(cwd, 'node_modules', '.bin', angular ? 'ngc' : 'tsc'), ['-p', 'tsconfig.json']);
    run(process.execPath, ['render.mjs', framework]);
  }
  console.log(`Passed: ${target}`);
} finally {
  rmSync(cwd, { recursive: true, force: true });
}
