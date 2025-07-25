import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
   test: {
      globals: true,
      environment: 'node',
      include: ['src/tests/**/*.test.ts'],
   },
   resolve: {
      alias: {
         '@lib': path.resolve(__dirname, 'src/lib'),
         '@middleware': path.resolve(__dirname, 'src/middleware'),
         '@models': path.resolve(__dirname, 'src/models'),
         '@routes': path.resolve(__dirname, 'src/routes'),
         '@schemas': path.resolve(__dirname, 'src/schemas'),
         '@mytypes': path.resolve(__dirname, 'src/types'),
         '@utils': path.resolve(__dirname, 'src/utils'),
      },
   },
});
