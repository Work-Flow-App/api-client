import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      hooks: 'src/hooks.ts',
    },
    format: ['cjs', 'esm'],
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: false,
    outExtension: ({ format }) => ({
      js: format === 'esm' ? '.js' : '.js',
    }),
    esbuildOptions(options, { format }) {
      options.outdir = format === 'esm' ? 'dist/esm' : 'dist/cjs';
    },
  },
]);
