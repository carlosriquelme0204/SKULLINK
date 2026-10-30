// Gera as três versões do jogo a partir de src/skullink.html.
//   node build.js                     -> dist/skullink_cidade.html, dist/skullink_dev.html, dist/app/
//   node build.js --version X         -> usa X como versão do app (padrão: data/hora de Brasília)
//   node build.js --deploy <pasta>    -> também copia dist/app/ pra <pasta> (o repositório do GitHub Pages)
//
// Marcações no código-fonte:
//   @@[dev] ... @@[end]               só na versão DEV
//   @@[app] ... @@[else] ... @@[end]  um trecho no app, outro nas demais
//   @@[cidade,dev] / @@[!app]         várias versões / todas menos uma
//   @@VERSION@@                       número de versão do app
// Uma marcação sozinha numa linha some junto com a linha.
const fs = require('fs'), path = require('path');

const ROOT = __dirname, SRC = path.join(ROOT, 'src'), DIST = path.join(ROOT, 'dist');
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };

function nowVersion() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return `${p.year}.${p.month}.${p.day}-${p.hour}${p.minute}`;
}

function preprocess(text, target, version) {
  text = text.replace(/^[ \t]*(@@\[[^\]\n]*\])[ \t]*\r?\n/gm, '$1');
  const re = /@@\[([^\]\n]*)\]/g, stack = [];
  let out = '', last = 0, m;
  const on = () => stack.every(s => s.on);
  while ((m = re.exec(text))) {
    if (on()) out += text.slice(last, m.index);
    last = re.lastIndex;
    const tag = m[1].trim();
    if (tag === 'end') { if (!stack.pop()) throw new Error('@@[end] sem @@[...] antes, posição ' + m.index); }
    else if (tag === 'else') { const s = stack[stack.length - 1]; if (!s) throw new Error('@@[else] solto, posição ' + m.index); s.on = !s.hit; }
    else {
      const hit = tag.split(',').map(t => t.trim()).some(t => t[0] === '!' ? t.slice(1) !== target : t === target);
      stack.push({ on: hit, hit });
    }
  }
  if (stack.length) throw new Error('faltou @@[end]');
  if (on()) out += text.slice(last);
  return out.replace(/@@VERSION@@/g, version);
}

const version = arg('--version') || nowVersion();
const src = fs.readFileSync(path.join(SRC, 'skullink.html'), 'utf8');
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'app'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'skullink_cidade.html'), preprocess(src, 'cidade', version));
fs.writeFileSync(path.join(DIST, 'skullink_dev.html'), preprocess(src, 'dev', version));
fs.writeFileSync(path.join(DIST, 'app', 'index.html'), preprocess(src, 'app', version));
for (const f of fs.readdirSync(path.join(SRC, 'app'))) {
  const from = path.join(SRC, 'app', f), to = path.join(DIST, 'app', f);
  if (/\.(js|webmanifest|txt|html)$/.test(f)) fs.writeFileSync(to, preprocess(fs.readFileSync(from, 'utf8'), 'app', version));
  else fs.copyFileSync(from, to);
}
console.log('versão', version, '-> dist/');

const deploy = arg('--deploy');
if (deploy) {
  for (const f of fs.readdirSync(path.join(DIST, 'app'))) fs.copyFileSync(path.join(DIST, 'app', f), path.join(deploy, f));
  console.log('app copiado pra', deploy);
}
