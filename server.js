// Force production mode — dev uses `next dev` directly
process.env.NODE_ENV = 'production';

// Load .env.local for VPS deployments
try { require('dotenv').config({ path: '.env.local' }); } catch (e) { /* dotenv is a devDep */ }

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:' + (process.env.PORT || 3000));
  });
});
