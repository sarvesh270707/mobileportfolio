const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Remove server fingerprinting
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; media-src 'self' data:; connect-src 'self'; frame-ancestors 'self' https://*.run.app https://ai.studio https://*.google.com; form-action 'self' mailto: tel:; base-uri 'self'; object-src 'none';"
  );

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features & APIs
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');

  // HTTP Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  next();
});

// Protect internal & sensitive files from being served
const BLOCKED_FILES = new Set([
  'package.json',
  'package-lock.json',
  'bun.lock',
  'server.js',
  'metadata.json',
  '.env',
  '.env.example',
  'profile_photo.b64'
]);

app.use((req, res, next) => {
  const reqPath = req.path.replace(/^\/+/, '');
  if (BLOCKED_FILES.has(reqPath) || (reqPath.startsWith('.') && !reqPath.startsWith('.well-known/'))) {
    return res.status(404).send('Not Found');
  }
  next();
});

// Serve assets and static files safely with dotfiles ignored
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  dotfiles: 'ignore',
  maxAge: '1y',
  immutable: true
}));

app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), {
  dotfiles: 'allow',
  maxAge: '1d'
}));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

