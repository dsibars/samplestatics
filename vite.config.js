import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Simple custom plugin to inject HTML partials natively at build-time
function htmlPartials() {
  return {
    name: 'html-partials',
    transformIndexHtml(html) {
      return html.replace(/<include src="([^"]+)"\s*\/>/g, (match, filePath) => {
        const absolutePath = path.resolve(__dirname, 'src', filePath);
        if (fs.existsSync(absolutePath)) {
          return fs.readFileSync(absolutePath, 'utf8');
        }
        return `<!-- Missing partial: ${filePath} -->`;
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const isDebug = mode === 'debug';
  
  return {
    root: 'src',
    plugins: [htmlPartials(), viteSingleFile()],
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      minify: isDebug ? false : 'esbuild',
      cssMinify: isDebug ? false : 'esbuild',
    }
  };
});
