// Serve the assembled Pages artifact, never the repository itself.
//
// `python3 build.py --site _site` copies exactly the published files (build.py
// SITE_FILES) into _site/, which is also what deploy.yml uploads. Serving that
// directory means these tests check the artifact that ships, so a file missing
// from the list fails here and private notes or sources cannot be reached.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';

const site = resolve(fileURLToPath(new URL('../../_site/', import.meta.url)));
const types = { html: 'text/html', css: 'text/css', js: 'text/javascript' };
createServer(async (req, res) => {
  const requested = new URL(req.url, 'http://localhost').pathname;
  // Mirror a GitHub Pages project mount while retaining root URLs for existing
  // tests.
  let path = requested.startsWith('/estonia-fire-planner/')
    ? requested.slice('/estonia-fire-planner'.length) : requested;
  if (path === '/') path = '/index.html';
  let file;
  try { file = resolve(site, '.' + decodeURIComponent(path)); } catch { file = ''; }
  const type = types[path.split('.').pop()];
  if (!file.startsWith(site + sep) || !type) {
    res.writeHead(404).end();
    return;
  }
  try {
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
    res.end(content);
  } catch { res.writeHead(404).end(); }
}).listen(8043, '127.0.0.1');
