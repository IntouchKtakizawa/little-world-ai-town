import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

// Explicit list keeps development files and repository metadata out of hosting.
const files = [
  'index.html', 'style.css', 'app.js', 'god-mode.js', 'simulation.js',
  'city-mode.js', 'city-simulation.js', 'city.css',
  'world-mode.js', 'world-simulation.js', 'world.css',
  'earth-data.js', 'earth-geography.js', 'earth-renderer.js',
  'data/earth-blue-marble.jpg', 'favicon.svg',
];
await rm('dist', { recursive: true, force: true });
await mkdir('dist/data', { recursive: true });
for (const file of files) await cp(file, `dist/${file}`);
await writeFile('dist/.nojekyll', '');
console.log(`Built ${files.length} static files in dist/`);
