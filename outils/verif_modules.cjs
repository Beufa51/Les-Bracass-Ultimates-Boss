const { chromium } = require('playwright');
const files = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/README.md');
  for (const f of files) { const r = await p.evaluate(async (f) => { try { await import('/' + f); return 'ok'; } catch (e) { return e.message; } }, f); if (r !== 'ok') console.log(f, r); }
  await b.close(); })();
