import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8')) as {
  version: string;
};

export default defineConfig({
  entryPoints: ['lib/index.ts'],
  format: ['cjs', 'esm'],
  target: 'es2020',
  dts: {
    resolve: true,
    compilerOptions: {
      skipLibCheck: true,
    },
  },
  outDir: 'dist',
  clean: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  define: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  },
});
