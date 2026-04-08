import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const isDebug = mode === 'debug';
  
  return {
    root: 'src',
    plugins: [viteSingleFile()],
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      minify: isDebug ? false : 'esbuild',
      cssMinify: isDebug ? false : 'esbuild',
    }
  };
});
