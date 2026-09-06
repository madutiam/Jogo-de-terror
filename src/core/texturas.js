/**
 * Recorte de texturas em memoria.
 *
 * Os PNGs entregues tem muita area transparente em volta do desenho, e alguns
 * precisam ser usados so em parte (a cabeca do Gato, por exemplo). Em vez de
 * mexer nos arquivos, recortamos a janela util uma unica vez, no carregamento,
 * e o jogo passa a usar a textura recortada.
 *
 * Isso NAO altera nenhum arquivo em disco e NAO redesenha nada: e a mesma
 * imagem, so sem a moldura vazia.
 */

/**
 * @param {Phaser.Scene} cena
 * @param {string} origem   chave da textura ja carregada
 * @param {string} destino  chave da nova textura
 * @param {{x:number, y:number, largura:number, altura:number, escala?:number}} janela
 * @returns {boolean} false se a textura de destino ja existia
 */
export function recortarTextura(cena, origem, destino, janela) {
  if (cena.textures.exists(destino)) return false;

  const escala = janela.escala ?? 1;
  const larguraFinal = Math.max(1, Math.round(janela.largura * escala));
  const alturaFinal = Math.max(1, Math.round(janela.altura * escala));

  const imagem = cena.textures.get(origem).getSourceImage();
  const textura = cena.textures.createCanvas(destino, larguraFinal, alturaFinal);
  const ctx = textura.getContext();

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, larguraFinal, alturaFinal);
  ctx.drawImage(
    imagem,
    janela.x, janela.y, janela.largura, janela.altura,
    0, 0, larguraFinal, alturaFinal
  );

  textura.refresh();
  return true;
}

/**
 * Recorta um retalho e monta uma versao ESPELHADA em quatro, para poder ser
 * repetida sem emenda.
 *
 * Um retalho qualquer, repetido lado a lado, quase sempre mostra uma linha na
 * junta — foi o que aconteceu com o piso do quarto. Espelhando o retalho na
 * horizontal e na vertical, as bordas passam a ser identicas por construcao e
 * a junta some. A textura continua sendo a pedra dela, so refletida.
 *
 * @param {Phaser.Scene} cena
 * @param {string} origem
 * @param {string} destino
 * @param {{x:number, y:number, largura:number, altura:number}} janela
 */
export function recortarEspelhado(cena, origem, destino, janela) {
  if (cena.textures.exists(destino)) return false;

  const { x, y, largura: L, altura: A } = janela;
  const espelharY = janela.espelharY !== false;

  const imagem = cena.textures.get(origem).getSourceImage();
  const alturaFinal = espelharY ? A * 2 : A;

  const textura = cena.textures.createCanvas(destino, L * 2, alturaFinal);
  const ctx = textura.getContext();
  ctx.clearRect(0, 0, L * 2, alturaFinal);

  /** Desenha o retalho depois de aplicar o espelhamento pedido. */
  const copia = (inverterX, inverterY) => {
    ctx.save();
    ctx.translate(inverterX ? L * 2 : 0, inverterY ? A * 2 : 0);
    ctx.scale(inverterX ? -1 : 1, inverterY ? -1 : 1);
    ctx.drawImage(imagem, x, y, L, A, 0, 0, L, A);
    ctx.restore();
  };

  copia(false, false);
  copia(true, false);

  if (espelharY) {
    copia(false, true);
    copia(true, true);
  }

  textura.refresh();
  return true;
}

/**
 * Fecha os buracos de dentro de um recorte.
 *
 * Alguns PNGs entregues passaram por um removedor de fundo automatico que,
 * junto com o fundo, comeu tudo que era escuro DENTRO do desenho. Na porta de
 * pedra isso apagou a argamassa entre os blocos: sobrou uma silhueta vazada,
 * que em cena le como recorte mal feito colado na parede.
 *
 * O conserto nao inventa desenho nenhum. Ele so distingue duas coisas que o
 * removedor confundiu:
 *
 *   - transparencia que VEM DE FORA — o fundo de verdade, que continua fora;
 *   - transparencia CERCADA pelo desenho — o buraco, que volta a ser opaco.
 *
 * A cor do preenchimento tambem nao e inventada: e a media dos pixels mais
 * escuros do proprio desenho, entao a argamassa volta na cor que ela teria.
 *
 * Nada e escrito em disco. O arquivo original continua intacto.
 *
 * @param {Phaser.Scene} cena
 * @param {string} origem
 * @param {string} destino
 * @param {{x:number, y:number, largura:number, altura:number}} janela
 */
export function preencherBuracos(cena, origem, destino, janela) {
  if (cena.textures.exists(destino)) return false;

  const { largura: L, altura: A } = janela;
  const imagem = cena.textures.get(origem).getSourceImage();
  const textura = cena.textures.createCanvas(destino, L, A);
  const ctx = textura.getContext();

  ctx.clearRect(0, 0, L, A);
  ctx.drawImage(imagem, janela.x, janela.y, L, A, 0, 0, L, A);

  const dados = ctx.getImageData(0, 0, L, A);
  const px = dados.data;
  const vazio = (i) => px[i * 4 + 3] < 24;

  // 1) O fundo de verdade: o vazio que se alcanca a partir da moldura.
  const deFora = new Uint8Array(L * A);
  const pilha = [];
  for (let x = 0; x < L; x++) {
    if (vazio(x)) pilha.push(x);
    const base = (A - 1) * L + x;
    if (vazio(base)) pilha.push(base);
  }
  for (let y = 0; y < A; y++) {
    const e = y * L;
    if (vazio(e)) pilha.push(e);
    const d = e + L - 1;
    if (vazio(d)) pilha.push(d);
  }
  while (pilha.length) {
    const p = pilha.pop();
    if (deFora[p]) continue;
    deFora[p] = 1;
    const y = (p / L) | 0;
    const x = p - y * L;
    if (x > 0 && !deFora[p - 1] && vazio(p - 1)) pilha.push(p - 1);
    if (x < L - 1 && !deFora[p + 1] && vazio(p + 1)) pilha.push(p + 1);
    if (y > 0 && !deFora[p - L] && vazio(p - L)) pilha.push(p - L);
    if (y < A - 1 && !deFora[p + L] && vazio(p + L)) pilha.push(p + L);
  }

  // 2) A cor: media do quinto mais escuro do que sobrou desenhado.
  const luzes = [];
  for (let i = 0; i < L * A; i++) {
    if (px[i * 4 + 3] < 200) continue;
    luzes.push((px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 3);
  }
  if (!luzes.length) { textura.refresh(); return true; }
  luzes.sort((a, b) => a - b);
  const corte = luzes[Math.floor(luzes.length * 0.2)];

  let r = 0, v = 0, b = 0, n = 0;
  for (let i = 0; i < L * A; i++) {
    if (px[i * 4 + 3] < 200) continue;
    const brilho = (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 3;
    if (brilho > corte) continue;
    r += px[i * 4]; v += px[i * 4 + 1]; b += px[i * 4 + 2]; n++;
  }
  r = Math.round(r / n); v = Math.round(v / n); b = Math.round(b / n);

  // 3) Todo vazio que nao veio de fora e buraco: volta a ser opaco.
  let tapados = 0;
  for (let i = 0; i < L * A; i++) {
    if (deFora[i] || px[i * 4 + 3] >= 24) continue;
    px[i * 4] = r; px[i * 4 + 1] = v; px[i * 4 + 2] = b; px[i * 4 + 3] = 255;
    tapados++;
  }

  ctx.putImageData(dados, 0, 0);
  textura.refresh();
  console.info('[texturas] ' + destino + ': ' + tapados +
    ' px de buraco fechados em rgb(' + r + ',' + v + ',' + b + ')');
  return true;
}
