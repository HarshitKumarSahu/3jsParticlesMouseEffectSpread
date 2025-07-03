import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl()],
  resolve: {
    alias: {
      'three/examples/jsm': 'node_modules/three/examples/jsm',
    },
  },
});