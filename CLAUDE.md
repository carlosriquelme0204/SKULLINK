# SKULL.INK

Jogo de ação 3D em terceira pessoa (Three.js r128 via CDN, tudo num HTML só) para navegador (PC e celular) e app Android (PWA).
Uma caveira punk patrulha uma cidade neon infinita: parkour (parede, pulo duplo, Corda do Céu), alertas de crime no celular,
briga com 7 armas e uma ult de 4 barras, lojas (Arsenal do Caolho, Brechó da Rubi, Salão da Kika, Cantina do Bigode, Pet Shop da Nina, Mobília Maldita), esconderijo (apê decorável no Edifício Caveira),
chefões Marreta e Vó Nocturna (secreta), dublagem gerada no código e save automático.
Visual: low-poly facetado, preto/osso/vermelho com neons; UI de fanzine (contorno grosso, sombra vermelha deslocada, estêncil + máquina de escrever).
O dono do projeto fala português: textos do jogo, comentários e respostas em pt-BR.

## Estrutura

- `src/skullink.html`: **o único código do jogo. Toda mudança é feita aqui.**
- `src/app/`: arquivos fixos do app (`sw.js`, manifest, ícones, instruções do APK).
- `build.js`: gera as três versões. Nunca edite os arquivos gerados à mão.
  - `skullink_cidade.html`: versão normal para o navegador.
  - `skullink_dev.html`: tudo liberado, ult infinita, atalhos Shift+número, seletor de missão. Usa outro save.
  - `app/`: PWA publicado no repositório `carlosriquelme0204/carlosriquelme0204.github.io` (GitHub Pages).
- `tools/screenshot.js`: abre uma versão no Chromium headless, inicia o jogo, tira um print e lista erros de JS.

## Marcações de versão em `src/`

```
@@[dev] ... @@[end]                só na DEV
@@[app] ... @@[else] ... @@[end]   um trecho no app, outro nas demais
@@[cidade,dev] / @@[!app]          várias versões / todas menos uma
@@VERSION@@                        versão do app (data/hora de Brasília no build)
```
Uma marcação sozinha numa linha some junto com a linha. Dá para aninhar marcações, mas mantenha simples.
Os saves ficam separados pelas chaves `skullink_save_v1` e `skullink_DEV_save_v1`. Não mude essas chaves, ou o jogador perde o progresso.

## Fluxo de trabalho

1. Editar `src/skullink.html`. O arquivo tem cerca de 4.200 linhas: use Grep para achar o trecho, não leia o arquivo inteiro.
2. `node build.js` (gera só cidade e dev). **O app (`app/`) só é atualizado quando o dono pedir:** aí use `node build.js --app`.
3. `node tools/screenshot.js cidade` (e `dev`/`app` se a mudança mexer neles). Olhar o print e os erros.
4. **Toda atualização ganha um item no menu UPDATE** (`#updBox`, lista "🆕 ESTA VERSÃO", item novo no topo), em linguagem de jogador.
5. Commit de `src/` junto com os arquivos gerados, direto no `main`, e push (o dono baixa os arquivos do `main`).
6. Publicar o app, **só quando o dono pedir**: `node build.js --app --deploy ../carlosriquelme0204.github.io`, depois commit e push nesse repositório.
   O `sw.js` com versão nova faz o app instalado se atualizar sozinho.
