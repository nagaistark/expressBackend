import { build } from 'esbuild';
import path, { dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const entry = process.argv[2];

if (!entry) {
   console.error('Usage: node build-any.mjs <input.ts>');
   process.exit(1);
}

if (!existsSync(entry)) {
   console.error(`Error: File "${entry}" not found.`);
   process.exit(1);
}

const fileName = path.basename(entry, path.extname(entry));
const out = path.join('src', 'dist', `${fileName}.js`);

const distDir = path.join('src', 'dist');
if (!existsSync(distDir)) {
   mkdirSync(distDir, { recursive: true });
}

build({
   entryPoints: [entry],
   outfile: out,
   bundle: true,
   format: 'esm',
   platform: 'browser',
   target: 'es2020',
   sourcemap: true,
   minify: false,
   treeShaking: true,
   define: {
      'process.env.NODE_ENV': '"development"',
      'process.env': '{}',
      process: '{}',
   },
   logLevel: 'info',
}).catch(() => process.exit(1));
