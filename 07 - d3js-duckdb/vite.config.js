import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  
  publicDir: path.resolve(process.cwd(), '../00 - data'),

  server: {
    fs: {
      allow: [
        path.resolve(process.cwd(), '..')
      ]
    }
  }
});