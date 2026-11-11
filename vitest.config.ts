import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';
export default defineConfig({
  resolve:{alias:[
    {find:'@lucianopignotti/passport-stamps/angular',replacement:fileURLToPath(new URL('./dist/angular/fesm2022/lucianopignotti-passport-stamps-angular-build.mjs',import.meta.url))},
    {find:'@lucianopignotti/passport-stamps/element',replacement:fileURLToPath(new URL('./dist/element/index.js',import.meta.url))},
    {find:'@lucianopignotti/passport-stamps/react',replacement:fileURLToPath(new URL('./dist/react/index.js',import.meta.url))},
    {find:'@lucianopignotti/passport-stamps',replacement:fileURLToPath(new URL('./dist/core/index.js',import.meta.url))}
  ]},
  test:{environment:'jsdom',include:['src/**/*.spec.ts','src/**/*.spec.tsx'],setupFiles:['./tests/setup-frameworks.ts'],fileParallelism:false}
});
