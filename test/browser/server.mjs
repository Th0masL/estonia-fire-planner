// Serve only deployed assets, never private notes or repository metadata.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const types = { html: 'text/html', css: 'text/css', js: 'text/javascript' };
createServer(async (req, res) => {
  const requested = new URL(req.url, 'http://localhost').pathname;
  // Mirror a GitHub Pages project mount while retaining root URLs for existing
  // tests. Keep the same deployment-asset allowlist after removing the prefix.
  let path = requested.startsWith('/estonia-fire-planner/')
    ? requested.slice('/estonia-fire-planner'.length) : requested;
  if (path === '/') path = '/index.html';
  if (!/^\/(?:index\.html|simulator\.html|pension\.html|tokens\.css|styles\.css|src\/nav\.js|guide\/[a-z-]+\.html)$/.test(path)) {
    res.writeHead(404).end();
    return;
  }
  try {
    const content = await readFile(new URL(path.slice(1), root));
    res.writeHead(200, { 'Content-Type': types[path.split('.').pop()] + '; charset=utf-8' });
    res.end(content);
  } catch { res.writeHead(404).end(); }
}).listen(8043, '127.0.0.1');
