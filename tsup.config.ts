import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['lib/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      skipLibCheck: true,
    },
  },
  outDir: 'dist',
  clean: true,
});
