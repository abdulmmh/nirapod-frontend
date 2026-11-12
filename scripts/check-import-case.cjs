const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const sourceRoot = path.resolve('src');

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory() ? files(location) : location.endsWith('.ts') ? [location] : [];
  });
}

let errors = 0;
for (const filename of files(sourceRoot)) {
  const source = ts.preProcessFile(fs.readFileSync(filename, 'utf8'));
  for (const imported of source.importedFiles) {
    const name = imported.fileName;
    if (!name.startsWith('.') && !name.startsWith('src/')) continue;
    const stem = name.startsWith('src/') ? path.resolve(name) : path.resolve(path.dirname(filename), name);
    const target = [stem + '.ts', stem + '.d.ts', path.join(stem, 'index.ts')].find(fs.existsSync);
    if (!target) continue; // The TypeScript compiler reports missing imports.
    let directory = sourceRoot;
    for (const part of path.relative(sourceRoot, target).split(path.sep)) {
      if (!fs.readdirSync(directory).includes(part)) {
        console.error(path.relative(process.cwd(), filename) + ' imports a path with incorrect case: ' + name);
        errors++;
        break;
      }
      directory = path.join(directory, part);
    }
  }
}
if (errors) process.exitCode = 1;
