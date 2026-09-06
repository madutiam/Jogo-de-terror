/**
 * Monta o quarto da Fase 1 em tamanho grande, usando SO os pixels do desenho
 * original (`cenario 1`).
 *
 * ------------------------------------------------------------------------
 * POR QUE ESTE ARQUIVO FOI REFEITO
 *
 * A primeira versao montava a sala com varias imagens lado a lado — cantos,
 * parede repetida, o desenho original no meio — e depois tentava esconder as
 * juntas com faixas pretas. Duas coisas davam errado nisso:
 *
 *   1. As faixas escondiam a emenda e denunciavam a si mesmas. Retangulo preto
 *      em cima de cenario le como retangulo preto, nao como sombra.
 *   2. A penumbra que seguia a Alice era uma IMAGEM de tamanho fixo. Quando ela
 *      chegava perto de uma parede, parte da tela ficava fora dessa imagem — e
 *      o que fica fora nao escurece. Dai a faixa clara de borda reta.
 *
 * Agora e outro caminho:
 *
 *   - A parede inteira e o chao inteiro sao ASSADOS UMA VEZ, cada um numa
 *     textura unica do tamanho da sala. Nao existe emenda para o jogador achar
 *     porque nao existe segunda imagem.
 *   - A escuridao e uma RenderTexture do tamanho da TELA, presa a camera. Ela
 *     cobre tudo por definicao. A luz e feita APAGANDO circulos suaves dela —
 *     o da Alice, que anda com ela, e os fixos do ambiente. Nunca sobra canto
 *     sem tratar, e o recorte nunca e reto.
 *
 * O material fica NEUTRO na textura; quem cria o clima e a luz, em tempo real.
 * E o contrario do que estava: clima pintado no chao e luz nenhuma.
 * ------------------------------------------------------------------------
 */

import { CORES } from '../ui/theme.js';

/** Onde cada peca esta dentro do PNG original de 960x640. */
const PECAS = {
  /** O desenho original inteiro, do teto ate um pouco depois do pe da mobilia. */
  centro: { x: 58, y: 0, largura: 844, altura: 540 },
  /** Faixa limpa de parede: entre a mesinha e a cadeira, sem nada desenhado. */
  parede: { x: 162, y: 0, largura: 96, altura: 470 },
  /** Retalho de pedra SEM rejunte: entre as linhas de ladrilho y=575 e y=607. */
  pedra:  { x: 302, y: 578, largura: 128, altura: 26 },
};

/** Linha em que a parede do fundo encontra o chao, no desenho original. */
const LINHA_DO_CHAO = 470;

/**
 * Ate onde a textura da parede desce. Vai ALEM da linha do chao de proposito:
 * e nesse trecho que moram a xicara quebrada e o pe da mobilia, que antes eram
 * cortados em y=504 e sumiam. Daqui para baixo ela some em degrade no chao.
 */
const ALTURA_PAREDE = 540;
/** Onde comeca o degrade que dissolve a parede no chao. */
const INICIO_DO_DEGRADE = 512;

/** Rejunte medido no proprio desenho (linha de ladrilho horizontal). */
const AMOSTRA_REJUNTE = { x: 350, y: 573 };

/**
 * Quanto o desenho original se dissolve nas laterais, ao encontrar a parede
 * repetida. Estreito de proposito: a mesinha comeca a so 14 px da borda
 * esquerda da peca, e um degrade largo comeria ela.
 */
const PENA_ESQUERDA = 12;
const PENA_DIREITA = 40;

/**
 * Quao escuro fica o que nenhuma luz alcanca.
 *
 * MEDIDO na tela: com 0,93 o quarto virava um breu em que o jogador nao achava
 * nem a parede. 0,82 ainda esconde quase tudo, mas deixa a silhueta da sala
 * legivel — que e o que permite explorar em vez de tatear.
 */
const ESCURIDAO = 0.82;

/**
 * Onde cada movel esta DENTRO do desenho original de 960x640.
 * `topo` e a altura da superficie de cima, em pixels — e o que decide se a
 * Alice consegue subir nele pulando. `null` = intransponivel.
 *
 * Mora aqui, e nao na fase, porque o quarto e o mesmo na Fase 1 e no tutorial:
 * duas listas iguais em dois arquivos viravam duas listas diferentes um dia.
 */
export const MOVEIS = {
  mesinha: { x1: 72,  x2: 158, baseY: 480, topo: 128 },
  cadeira: { x1: 260, x2: 336, baseY: 482, topo: 82 },
  mesa:    { x1: 340, x2: 535, baseY: 480, topo: 114 },
  comoda:  { x1: 586, x2: 714, baseY: 488, topo: 120 },
  bau:     { x1: 682, x2: 765, baseY: 534, topo: 52 },
  espelho: { x1: 730, x2: 850, baseY: 478, topo: null },
};

// --------------------------------------------------------------- ferramentas

/** Numeros sorteados sempre na mesma ordem: o quarto e igual toda partida. */
function sorteio(semente) {
  let s = semente >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Cria (ou recria) uma textura de tela em branco e devolve o contexto 2D. */
function novaTela(cena, chave, largura, altura) {
  if (cena.textures.exists(chave)) cena.textures.remove(chave);
  const textura = cena.textures.createCanvas(chave, largura, altura);
  return { textura, ctx: textura.getContext() };
}

/**
 * Desenha um pedaco do PNG de origem, podendo espelhar nos dois eixos.
 * Espelhar e o que faz uma textura repetida FECHAR nas bordas: o lado direito
 * de um ladrilho e o espelho do lado esquerdo do vizinho, entao nao existe
 * linha na junta.
 */
function carimbar(ctx, fonte, peca, x, y, largura, altura, espelharX, espelharY) {
  ctx.save();
  ctx.translate(x + (espelharX ? largura : 0), y + (espelharY ? altura : 0));
  ctx.scale(espelharX ? -1 : 1, espelharY ? -1 : 1);
  ctx.drawImage(fonte, peca.x, peca.y, peca.largura, peca.altura, 0, 0, largura, altura);
  ctx.restore();
}

/**
 * Manchas grandes e suaves, espalhadas por cima de uma textura repetida.
 *
 * E isto que mata a sensacao de ladrilho: o olho acha a repeticao pelo RITMO.
 * Manchas bem maiores que o ladrilho quebram esse ritmo sem sujar o desenho,
 * porque nao tem borda e nao se alinham com nada.
 */
function manchar(ctx, rnd, largura, altura, quantidade, forcaMax, raioMin, raioMax) {
  for (let i = 0; i < quantidade; i++) {
    const x = rnd() * largura;
    const y = rnd() * altura;
    const raio = raioMin + rnd() * (raioMax - raioMin);
    const forca = forcaMax * (0.35 + rnd() * 0.65);
    const clareia = rnd() < 0.28;

    const degrade = ctx.createRadialGradient(x, y, 0, x, y, raio);
    const cor = clareia ? '150,166,186' : '0,0,0';
    degrade.addColorStop(0, 'rgba(' + cor + ',' + forca.toFixed(3) + ')');
    degrade.addColorStop(0.55, 'rgba(' + cor + ',' + (forca * 0.45).toFixed(3) + ')');
    degrade.addColorStop(1, 'rgba(' + cor + ',0)');

    ctx.fillStyle = degrade;
    ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
  }
}

/** Um circulo de luz suave, para ser APAGADO da escuridao. */
function pincelDeLuz(cena, chave, raio, forca) {
  if (cena.textures.exists(chave)) return chave;

  const lado = raio * 2;
  const textura = cena.textures.createCanvas(chave, lado, lado);
  const ctx = textura.getContext();

  const degrade = ctx.createRadialGradient(raio, raio, 0, raio, raio, raio);
  degrade.addColorStop(0.00, 'rgba(255,255,255,' + forca + ')');
  degrade.addColorStop(0.30, 'rgba(255,255,255,' + forca * 0.92 + ')');
  degrade.addColorStop(0.58, 'rgba(255,255,255,' + forca * 0.55 + ')');
  degrade.addColorStop(0.80, 'rgba(255,255,255,' + forca * 0.20 + ')');
  degrade.addColorStop(1.00, 'rgba(255,255,255,0)');

  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, lado, lado);
  textura.refresh();
  return chave;
}

// ------------------------------------------------------------------- o quarto

export class QuartoExtendido {
  /**
   * @param {Phaser.Scene} cena
   * @param {{largura:number, profundidade:number}} tamanho
   */
  constructor(cena, tamanho) {
    this.cena = cena;
    this.largura = tamanho.largura;
    this.profundidade = tamanho.profundidade;
    this.centroX = Math.round((this.largura - PECAS.centro.largura) / 2);

    /** Luzes que ficam paradas na sala. A da Alice e tratada a parte. */
    this.luzes = [];

    this.assarChao();
    this.assarParede();
    this.montarLuz();
    this.acenderAmbiente();
  }

  get fonte() {
    return this.cena.textures.get('fase1-quarto').getSourceImage();
  }

  // -------------------------------------------------------------------- chao

  /**
   * O chao inteiro numa textura so.
   *
   * O desenho dela tem o chao em PERSPECTIVA, entao ele nao pode ser repetido:
   * repetir um trapezio vira listra. O que da para repetir e o RETALHO DE PEDRA
   * sem rejunte. Em cima dele vem a grade de ladrilhos desenhada na perspectiva
   * certa, na cor de rejunte do proprio desenho — e o mesmo chao, agora fundo o
   * bastante para andar (regra 2: estender o fundo, aumentar a area).
   */
  assarChao() {
    const alturaChao = this.profundidade - LINHA_DO_CHAO;
    const { textura, ctx } = novaTela(this.cena, 'quarto/chao', this.largura, alturaChao);
    const rnd = sorteio(0x5a11ce);
    const fonte = this.fonte;

    // 1) A pedra, em mosaico espelhado nos dois eixos: as juntas fecham
    //    sozinhas e nao aparece linha nenhuma.
    const p = PECAS.pedra;
    const escala = 1.8;
    const lw = Math.round(p.largura * escala);
    const lh = Math.round(p.altura * escala);
    for (let linha = 0, y = 0; y < alturaChao; linha++, y += lh) {
      // Cada fileira entra deslocada, como fiada de tijolo. Alinhadas, as
      // juntas formavam colunas retas que o olho seguia de cima a baixo — era
      // metade da sensacao de ladrilho colado.
      const recuo = -Math.round(rnd() * lw);
      for (let coluna = 0, x = recuo; x < this.largura; coluna++, x += lw) {
        carimbar(ctx, fonte, p, x, y, lw, lh, coluna % 2 === 1, linha % 2 === 1);
      }
    }

    // 2) Manchas bem maiores que o ladrilho, para o olho parar de contar a
    //    repeticao. Umidade, poeira, desgaste — coisas de um quarto abandonado.
    // Muitas manchas somam escuridao depressa: com 150 delas a 0,22 o chao
    // ficava preto sozinho, antes de a luz entrar. Estas sujam sem apagar.
    manchar(ctx, rnd, this.largura, alturaChao, 80, 0.13, 130, 520);

    // 3) O chao inteiro desce de tom. MEDIDO na tela: sem isto ele ficava em
    //    (38,48,59) contra uma parede de (26,31,37) — uma vez e meia mais
    //    claro que a parede que ele encosta, e o encontro dos dois virava um
    //    degrau. Escurecido, os dois passam a parecer o mesmo comodo.
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.fillRect(0, 0, this.largura, alturaChao);

    // 4) A grade de ladrilhos, em perspectiva. Discreta: ela e para dar
    //    referencia de profundidade, nao para virar padrao de tecido.
    this.desenharLadrilhos(ctx, alturaChao);

    // 5) Sombra de contato no encontro com a parede. E o unico lugar onde uma
    //    sombra pintada se justifica: pe de parede e escuro em qualquer sala.
    //    A borda dela ondula de leve para nao virar um retangulo.
    this.sombraDeRodape(ctx, rnd);

    // 6) A borda da frente do chao cai no escuro: e onde a sala termina e a
    //    camera nao deveria mostrar mais nada.
    const fim = ctx.createLinearGradient(0, alturaChao - 150, 0, alturaChao);
    fim.addColorStop(0, 'rgba(0,0,0,0)');
    fim.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = fim;
    ctx.fillRect(0, alturaChao - 150, this.largura, 150);

    textura.refresh();

    this.chao = this.cena.add
      .image(0, LINHA_DO_CHAO, 'quarto/chao')
      .setOrigin(0, 0)
      .setDepth(-30);
  }

  desenharLadrilhos(ctx, alturaChao) {
    const cor = this.lerCorDoRejunte();

    // ---- linhas de profundidade (horizontais) ----
    // A primeira separacao vale 26 px, como no desenho, e vai crescendo:
    // ladrilho perto da camera e maior.
    let y = 0;
    let passo = 26;
    while (y < alturaChao) {
      // Some no fundo, onde os ladrilhos ficariam apertados demais e virariam
      // chuvisco. Aparece de verdade so da metade da sala para a frente.
      const forca = Math.min(1, y / (alturaChao * 0.42)) * 0.07;
      if (forca > 0.01) {
        ctx.fillStyle = 'rgba(' + cor + ',' + forca.toFixed(3) + ')';
        ctx.fillRect(0, Math.round(y), this.largura, 1);
      }
      y += passo;
      passo *= 1.15;
    }

    // ---- linhas transversais, convergindo para o ponto de fuga ----
    // O ponto de fuga fica bem acima da linha do chao: quanto mais alto, menos
    // as linhas abrem em leque. Com ele perto demais elas viravam listras.
    const fugaX = this.largura / 2;
    const fugaY = -1500;
    const larguraNaFrente = 118;
    const sobra = this.largura * 0.9;

    for (let x = -sobra; x < this.largura + sobra; x += larguraNaFrente) {
      const t = (0 - fugaY) / (alturaChao - fugaY);
      const xNoFundo = fugaX + (x - fugaX) * t;

      // A linha nasce invisivel no fundo e so ganha corpo perto da camera.
      // Desenhada com forca igual dos dois lados, ela virava um risco reto de
      // ponta a ponta — foi o que deixou o chao listrado.
      const tinta = ctx.createLinearGradient(0, 0, 0, alturaChao);
      tinta.addColorStop(0.00, 'rgba(' + cor + ',0)');
      tinta.addColorStop(0.45, 'rgba(' + cor + ',0.015)');
      tinta.addColorStop(1.00, 'rgba(' + cor + ',0.05)');
      ctx.strokeStyle = tinta;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xNoFundo, 0);
      ctx.lineTo(x, alturaChao);
      ctx.stroke();
    }
  }

  /**
   * Escuridao no pe da parede. Em vez de uma faixa reta, a altura da sombra
   * varia ao longo da sala — some e volta, como sombra de verdade.
   */
  sombraDeRodape(ctx, rnd) {
    const base = 104;
    const fase1 = rnd() * Math.PI * 2;
    const fase2 = rnd() * Math.PI * 2;

    for (let x = 0; x < this.largura; x++) {
      const ondula =
        Math.sin(x / 190 + fase1) * 16 + Math.sin(x / 57 + fase2) * 7;
      const altura = base + ondula;

      const degrade = ctx.createLinearGradient(0, 0, 0, altura);
      degrade.addColorStop(0, 'rgba(0,0,0,0.80)');
      degrade.addColorStop(0.45, 'rgba(0,0,0,0.34)');
      degrade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = degrade;
      ctx.fillRect(x, 0, 1, altura);
    }
  }

  lerCorDoRejunte() {
    const cor = this.cena.textures.getPixel(
      AMOSTRA_REJUNTE.x, AMOSTRA_REJUNTE.y, 'fase1-quarto'
    );
    if (!cor) return '20,26,32';
    return cor.red + ',' + cor.green + ',' + cor.blue;
  }

  // ------------------------------------------------------------------ parede

  /**
   * A parede do fundo inteira numa textura so, com o desenho original embutido
   * no meio dela. E aqui que a emenda vertical morre: a peca original e
   * dissolvida nas laterais e as manchas passam POR CIMA da junta, entao nao
   * existe linha onde uma imagem acaba e a outra comeca.
   */
  assarParede() {
    const { textura, ctx } = novaTela(
      this.cena, 'quarto/parede', this.largura, ALTURA_PAREDE
    );
    const rnd = sorteio(0xa11ce7);
    const fonte = this.fonte;

    // 1) Parede repetida, espelhada a cada faixa para as juntas fecharem.
    const p = PECAS.parede;
    for (let coluna = 0, x = 0; x < this.largura; coluna++, x += p.largura) {
      carimbar(ctx, fonte, p, x, 0, p.largura, p.altura, coluna % 2 === 1, false);
    }

    // 1b) A faixa de parede copiada traz o RODAPE ESCURO do desenho dela junto.
    //     Repetido de ponta a ponta, esse rodape virava uma barra preta reta que
    //     terminava de supetao onde o desenho original comeca — uma emenda pior
    //     que a que estavamos consertando. Aqui ele e dissolvido antes de o
    //     desenho original entrar, e quem faz o encontro com o chao passa a ser
    //     a sombra de contato, que e curva e nao tem ponta.
    ctx.globalCompositeOperation = 'destination-out';
    const rodape = ctx.createLinearGradient(0, 392, 0, p.altura);
    rodape.addColorStop(0, 'rgba(0,0,0,0)');
    rodape.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = rodape;
    ctx.fillRect(0, 392, this.largura, p.altura - 392);
    ctx.globalCompositeOperation = 'source-over';

    // 2) O desenho original, dissolvido nas bordas, colado no meio.
    ctx.drawImage(this.pecaCentralComPena(), this.centroX, 0);

    // 3) Manchas por cima de TUDO, inclusive da junta. Como elas nao respeitam
    //    onde uma imagem acaba, o olho passa a ler uma parede so.
    manchar(ctx, rnd, this.largura, ALTURA_PAREDE, 70, 0.17, 110, 460);
    this.escorridos(ctx, rnd);

    // 4) As pontas da sala afundam no escuro. Nao existe arte de parede lateral
    //    em perspectiva, entao e a sombra que fecha a sala — e como ela some em
    //    degrade, le como falta de luz, nao como tampa.
    const faixa = 420;
    const esq = ctx.createLinearGradient(0, 0, faixa, 0);
    esq.addColorStop(0, 'rgba(0,0,0,0.72)');
    esq.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = esq;
    ctx.fillRect(0, 0, faixa, ALTURA_PAREDE);

    const dir = ctx.createLinearGradient(this.largura - faixa, 0, this.largura, 0);
    dir.addColorStop(0, 'rgba(0,0,0,0)');
    dir.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = dir;
    ctx.fillRect(this.largura - faixa, 0, faixa, ALTURA_PAREDE);

    // 5) O alto da parede tambem escurece: teto sem luz.
    const alto = ctx.createLinearGradient(0, 0, 0, 200);
    alto.addColorStop(0, 'rgba(0,0,0,0.62)');
    alto.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = alto;
    ctx.fillRect(0, 0, this.largura, 200);

    textura.refresh();

    this.parede = this.cena.add
      .image(0, 0, 'quarto/parede')
      .setOrigin(0, 0)
      .setDepth(-20);
  }

  /**
   * O desenho original com as bordas dissolvidas: laterais para encontrar a
   * parede repetida, e o pe para derreter no chao em vez de terminar numa
   * linha reta — que era o que cortava a xicara quebrada ao meio.
   */
  pecaCentralComPena() {
    const p = PECAS.centro;
    const tela = document.createElement('canvas');
    tela.width = p.largura;
    tela.height = ALTURA_PAREDE;
    const ctx = tela.getContext('2d');

    ctx.drawImage(
      this.fonte,
      p.x, p.y, p.largura, ALTURA_PAREDE,
      0, 0, p.largura, ALTURA_PAREDE
    );

    // `destination-out` apaga usando o alpha do que for pintado: e assim que a
    // borda vira degrade em vez de corte.
    ctx.globalCompositeOperation = 'destination-out';

    const esq = ctx.createLinearGradient(0, 0, PENA_ESQUERDA, 0);
    esq.addColorStop(0, 'rgba(0,0,0,1)');
    esq.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = esq;
    ctx.fillRect(0, 0, PENA_ESQUERDA, ALTURA_PAREDE);

    const dir = ctx.createLinearGradient(p.largura - PENA_DIREITA, 0, p.largura, 0);
    dir.addColorStop(0, 'rgba(0,0,0,0)');
    dir.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = dir;
    ctx.fillRect(p.largura - PENA_DIREITA, 0, PENA_DIREITA, ALTURA_PAREDE);

    const pe = ctx.createLinearGradient(0, INICIO_DO_DEGRADE, 0, ALTURA_PAREDE);
    pe.addColorStop(0, 'rgba(0,0,0,0)');
    pe.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = pe;
    ctx.fillRect(0, INICIO_DO_DEGRADE, p.largura, ALTURA_PAREDE - INICIO_DO_DEGRADE);

    ctx.globalCompositeOperation = 'source-over';
    return tela;
  }

  /** Marcas de agua escorrida na parede. Verticais, irregulares, discretas. */
  escorridos(ctx, rnd) {
    for (let i = 0; i < 26; i++) {
      const x = rnd() * this.largura;
      const topo = rnd() * 120;
      const comprimento = 130 + rnd() * 300;
      const largura = 3 + rnd() * 16;
      const forca = 0.05 + rnd() * 0.10;

      const degrade = ctx.createLinearGradient(0, topo, 0, topo + comprimento);
      degrade.addColorStop(0, 'rgba(0,0,0,0)');
      degrade.addColorStop(0.3, 'rgba(0,0,0,' + forca.toFixed(3) + ')');
      degrade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = degrade;
      ctx.fillRect(x, topo, largura, comprimento);
    }
  }

  // ----------------------------------------------------------------- a luz

  /**
   * A escuridao e uma RenderTexture do tamanho da TELA, presa a camera.
   *
   * Ela e repintada de preto a cada quadro e a luz e feita APAGANDO circulos
   * suaves dela. Duas consequencias que a versao anterior nao tinha:
   *
   *   - cobre a tela inteira por definicao, entao nunca sobra canto claro com
   *     borda reta, esteja a Alice onde estiver;
   *   - da para ter mais de uma fonte de luz. E o que faz a sala parecer
   *     ILUMINADA em vez de ter um circulo em volta da personagem.
   */
  montarLuz() {
    this.raioAlice = 380;
    this.pincelAlice = pincelDeLuz(this.cena, 'quarto/luzAlice', this.raioAlice, 0.93);

    this.criarTelaDeLuz();

    // A tela muda de tamanho quando a janela muda. A escuridao tem que
    // acompanhar, senao volta a sobrar borda — que era exatamente o defeito.
    const aviso = () => this.criarTelaDeLuz();
    this.cena.scale.on('resize', aviso);
    this.cena.events.once('shutdown', () => this.cena.scale.off('resize', aviso));
    this.cena.events.once('destroy', () => this.cena.scale.off('resize', aviso));
  }

  criarTelaDeLuz() {
    const largura = this.cena.scale.width;
    const altura = this.cena.scale.height;

    this.escuro?.destroy();
    this.escuro = this.cena.add
      .renderTexture(0, 0, largura, altura)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(800);

    this.montarVinheta(largura, altura);
  }

  /**
   * Vinheta: escurece as quinas da tela. Radial, nao retangular — quina de
   * tela escura le como lente; quatro barras pretas leem como erro.
   */
  montarVinheta(largura, altura) {
    const chave = 'quarto/vinheta';
    if (!this.cena.textures.exists(chave)) {
      const lado = 512;
      const textura = this.cena.textures.createCanvas(chave, lado, lado);
      const ctx = textura.getContext();
      const meio = lado / 2;
      const degrade = ctx.createRadialGradient(meio, meio, meio * 0.54, meio, meio, meio * 0.80);
      degrade.addColorStop(0, 'rgba(0,0,0,0)');
      degrade.addColorStop(1, 'rgba(0,0,0,0.52)');
      ctx.fillStyle = degrade;
      ctx.fillRect(0, 0, lado, lado);
      textura.refresh();
    }

    this.vinheta?.destroy();
    this.vinheta = this.cena.add
      .image(0, 0, chave)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(802);
    this.vinheta.setDisplaySize(largura, altura);
  }

  /**
   * Luzes fixas da sala. Elas nao existem para clarear: existem para o jogador
   * ter em que se apoiar no escuro. Sem nenhum ponto de referencia, uma sala
   * grande e escura vira um corredor sem fim.
   */
  acenderAmbiente() {
    const meio = this.centroX + PECAS.centro.largura / 2;

    // O coracao da sala, onde esta a mobilia desenhada.
    this.adicionarLuz(meio, LINHA_DO_CHAO + 90, 520, 0.50);
    // Duas brasas fracas, uma para cada lado, para o meio nao ser o unico lugar
    // reconhecivel da sala.
    this.adicionarLuz(meio - 900, LINHA_DO_CHAO + 130, 380, 0.30);
    this.adicionarLuz(meio + 900, LINHA_DO_CHAO + 130, 380, 0.30);
  }

  /**
   * @param {number} x      posicao no mundo
   * @param {number} y      posicao no mundo
   * @param {number} raio   alcance da luz, em pixels
   * @param {number} forca  0..1, quanto ela come da escuridao no centro
   *
   * Cada luz ganha o PROPRIO pincel, ja no tamanho e na forca finais. O motivo
   * e chato mas decisivo: a forma de `erase` que aceita escala e opacidade num
   * objeto de configuracao nao apaga nada — falha calada. So a forma simples,
   * `erase(chave, x, y)`, funciona. Entao o tamanho e a forca tem que estar
   * assados no pincel, nao passados na chamada.
   */
  adicionarLuz(x, y, raio = 300, forca = 0.5) {
    const chave = 'quarto/luz' + Math.round(raio) + '_' + Math.round(forca * 100);
    pincelDeLuz(this.cena, chave, Math.round(raio), forca);
    this.luzes.push({ x, y, raio: Math.round(raio), chave });
  }

  /**
   * Chamar a cada quadro com a posicao da Alice.
   * (O nome antigo continua: o tutorial chama por ele.)
   */
  seguirComEscuridao(x, y) {
    if (!this.escuro) return;
    const camera = this.cena.cameras.main;

    this.escuro.clear();
    this.escuro.fill(CORES.preto, ESCURIDAO);

    for (const luz of this.luzes) {
      this.apagarLuz(luz.chave, luz.raio, luz.x, luz.y, camera);
    }

    // A da Alice por ultimo, para ser sempre a mais forte.
    this.apagarLuz(this.pincelAlice, this.raioAlice, x, y - 40, camera);
  }

  apagarLuz(pincel, raio, x, y, camera) {
    const ex = x - camera.scrollX - raio;
    const ey = y - camera.scrollY - raio;

    // Fora da tela nao adianta apagar.
    if (ex > this.escuro.width || ey > this.escuro.height ||
        ex + raio * 2 < 0 || ey + raio * 2 < 0) return;

    this.escuro.erase(pincel, ex, ey);
  }

  // -------------------------------------------------------------------- mobilia

  /** Converte uma coordenada X do desenho original para esta sala. */
  paraSala(xOriginal) {
    return this.centroX + (xOriginal - PECAS.centro.x);
  }

  /**
   * Transforma a mobilia DESENHADA em obstaculo de verdade.
   * Sem isso a Alice atravessa a mesa e a cadeira — e um cenario que se pode
   * atravessar ensina o jogador que o cenario e mentira.
   *
   * @param {Phaser.Scene} cena precisa ter `criarObstaculo` (GameplayScene)
   */
  montarMobilia(cena) {
    for (const movel of Object.values(MOVEIS)) {
      const x1 = this.paraSala(movel.x1);
      const x2 = this.paraSala(movel.x2);
      const largura = x2 - x1;

      // MEDIDO: com 30 px de fundo, o corpo da mesinha ficava em y 457..487 e o
      // da Alice comecava em 496 — ela nunca encostava em movel nenhum, e o
      // quarto inteiro era cenario atravessavel. Com 44 px, e com o limite do
      // fundo em 478, todos os moveis voltam a existir para a fisica.
      cena.criarObstaculo({
        x: x1 + largura / 2,
        y: movel.baseY - 8,
        largura,
        profundidade: 44,
        alturaTopo: movel.topo ?? undefined,
      });
    }
  }

  /** Onde um movel especifico ficou na sala grande. */
  movel(nome) {
    const m = MOVEIS[nome];
    const x1 = this.paraSala(m.x1);
    const x2 = this.paraSala(m.x2);
    return { x: (x1 + x2) / 2, y: m.baseY - 8, largura: x2 - x1, topo: m.topo };
  }
}
