import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
const run = (bin, args) => execFileSync(`node_modules/.bin/${bin}`, args, {stdio:'inherit'});
run('tsc', ['-p','tsconfig.core.json']);
run('tsc', ['-p','tsconfig.react.json']);
run('tsc', ['-p','tsconfig.element.json']);
run('ng-packagr', ['-p','src/angular/ng-package.json','-c','src/angular/tsconfig.lib.json']);
// This is a subpath of the root package, not a separately published Angular package.
rmSync('dist/angular/package.json');
