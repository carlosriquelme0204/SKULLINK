// Abre uma versão buildada no Chromium headless, começa o jogo, anda um pouco e tira um print.
//   node tools/screenshot.js [cidade|dev|app] [saida.png]
// Mostra erros de JavaScript no terminal. O Three.js vem do pacote npm (a CDN pode estar bloqueada no container).
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');

const which = process.argv[2] || 'cidade';
const out = process.argv[3] || path.join(os.tmpdir(), `skullink_${which}.png`);
const file = path.join(__dirname, '..', 'dist', which === 'app' ? 'app/index.html' : `skullink_${which}.html`);

const cache = path.join(os.tmpdir(), 'skullink-three');
const three = path.join(cache, 'package', 'build', 'three.min.js');
if (!fs.existsSync(three)) {
  fs.mkdirSync(cache, { recursive: true });
  execSync('npm pack three@0.128.0 --silent && tar xzf three-0.128.0.tgz package/build/three.min.js', { cwd: cache });
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route(/three\.min\.js/, r => r.fulfill({ path: three, contentType: 'text/javascript' }));
  await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await p.goto('file://' + file);
  await p.waitForTimeout(3000);
  await p.click('#play');
  await p.keyboard.down('KeyW'); await p.waitForTimeout(1500); await p.keyboard.up('KeyW');
  await p.waitForTimeout(1000);
  await p.screenshot({ path: out });
  await b.close();
  console.log('print:', out);
  console.log(errs.length ? 'ERROS:\n' + errs.join('\n') : 'sem erros de JavaScript');
  process.exit(errs.length ? 1 : 0);
})();
