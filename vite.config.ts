import { defineConfig } from 'vite';

// Relative base so the build works under any GitHub Pages sub-path.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 }, // Phaser alone is ~1.4 MB
});
