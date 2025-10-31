// flatten.ts (ESM version)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const visited = new Set<string>();

function flatten(filePath: string, projectRoot: string): string {
   const absPath = path.resolve(projectRoot, filePath);

   if (visited.has(absPath)) return ''; // already included
   visited.add(absPath);

   let code = fs.readFileSync(absPath, 'utf8');
   let result = '';

   const importRegex = /^import\s+(?:[\s\S]+?)\s+from\s+['"](.+)['"];?$/gm;
   let match: RegExpExecArray | null;

   while ((match = importRegex.exec(code)) !== null) {
      let importPath = match[1];

      // Only handle relative imports (skip node_modules, etc.)
      if (importPath.startsWith('.')) {
         let tsPath = path.resolve(path.dirname(absPath), importPath);

         // add .ts extension if missing
         if (!tsPath.endsWith('.ts')) tsPath += '.ts';

         result += flatten(tsPath, projectRoot);
      }
   }

   // Remove import/export lines, keep the actual code
   code = code
      .replace(importRegex, '')
      .replace(
         /^export\s+(?=default|const|function|class|interface|type)/gm,
         ''
      );

   result += `\n// ---- ${path.relative(projectRoot, absPath)} ----\n` + code;
   return result;
}

function main() {
   const projectRoot = path.resolve(__dirname, 'src'); // adjust if needed
   const entryFile = path.join(projectRoot, 'server.ts');

   const flattened = flatten(entryFile, projectRoot);

   fs.mkdirSync(path.join(projectRoot, '../dist'), { recursive: true });
   fs.writeFileSync(
      path.join(projectRoot, '../dist/flattened.ts'),
      flattened,
      'utf8'
   );
   console.log('Flattened project written to dist/flattened.ts');
}

main();
