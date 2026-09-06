/**
 * Uma sala montada a partir de UMA imagem inteira.
 *
 * O quarto principal e um caso especial: veio como uma tela de 960x640 e teve
 * de ser desmontado e remontado maior. As salas novas — corredor, despensa,
 * sala lateral, sotao — vieram inteiras, cada uma no seu desenho. Aqui elas
 * entram sem recorte nenhum.
 *
 * O QUE ESTA CLASSE RESOLVE
 *
 * Cada desenho veio num tamanho diferente (1774x887, 1536x1024...) e com a
 * linha do chao — onde a parede encontra o piso — em alturas diferentes. Se
 * cada sala entrasse como veio, a Alice mudaria de tamanho ao trocar de comodo
 * e a perspectiva quebraria.
 *
 * Entao cada sala e escalada para a linha do chao dela cair exatamente em
 * PROFUNDIDADE.FUNDO, que e onde o quarto principal ja poe a dele. Dai para a
 * frente tudo funciona igual em toda a fase: a mesma escala por profundidade,
 * a mesma ordem de desenho, o mesmo chao.
 *
 * Abaixo do desenho, o chao CONTINUA — o jogo estende com a textura de pedra e
 * uma sombra de rodape, do mesmo jeito que no quarto. E o que da profundidade
 * para andar, em vez de uma faixa rasa colada na parede.
 */

import { PROFUNDIDADE, profundidadeDeDesenho } from '../core/constants.js';
import { CORES } from '../ui/theme.js';
import { Iluminacao } from './Iluminacao.js';

/** Numeros sorteados sempre na mesma ordem: a sala e igual toda partida. */
function sorteio(semente) {
  let s = semente >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class SalaDesenhada {
  /**
   * @param {Phaser.Scene} cena
   * @param {{
   *   chave: string,          textura ja carregada
   *   linhaDoChao: number,    y, na imagem original, onde a parede encontra o piso
   *   semente?: number,
   *   luzes?: Array<{x:number,y:number,raio:number,forca:number}>  em fracao da largura
   * }} config
   */
  constructor(cena, config) {
    this.cena = cena;
    this.config = config;

    const fonte = cena.textures.get(config.chave).getSourceImage();
    this.fonteLargura = fonte.width;
    this.fonteAltura = fonte.height;

    // A escala que poe a linha do chao dela em PROFUNDIDADE.FUNDO.
    this.escala = PROFUNDIDADE.FUNDO / config.linhaDoChao;
    this.largura = Math.round(this.fonteLargura * this.escala);
    this.profundidade = PROFUNDIDADE.FRENTE;

    this.montarChao();
    this.montarDesenho();
    this.iluminacao = new Iluminacao(cena);
    this.acenderLuzes();
  }

  /**
   * O chao que continua abaixo do desenho.
   *
   * A imagem da sala mostra so um pedaco raso de piso — o bastante para a
   * parede encostar. O resto e desenhado aqui, na cor media do piso dela, com
   * uma sombra de contato ondulada no encontro e a borda da frente afundando no
   * escuro. Nao e textura nova: e a cor da propria sala, esticada com sujeira
   * por cima para nao virar uma chapa lisa.
   */
  montarChao() {
    const chave = 'sala/' + this.config.chave + '/chao';
    const altura = this.profundidade - PROFUNDIDADE.FUNDO;
    if (this.cena.textures.exists(chave)) this.cena.textures.remove(chave);

    const textura = this.cena.textures.createCanvas(chave, this.largura, altura);
    const ctx = textura.getContext();
    const rnd = sorteio(0xc4a0 + this.config.chave.length * 977);

    // Cor media do piso da propria sala, lida logo abaixo da linha do chao.
    const cor = this.corDoPiso();
    ctx.fillStyle = 'rgb(' + cor + ')';
    ctx.fillRect(0, 0, this.largura, altura);

    // Manchas grandes, para o chao nao virar uma chapa de cor unica.
    for (let i = 0; i < 70; i++) {
      const x = rnd() * this.largura;
      const y = rnd() * altura;
      const raio = 110 + rnd() * 380;
      const clareia = rnd() < 0.3;
      const forca = 0.10 * (0.4 + rnd() * 0.6);
      const tinta = clareia ? '150,166,186' : '0,0,0';

      const g = ctx.createRadialGradient(x, y, 0, x, y, raio);
      g.addColorStop(0, 'rgba(' + tinta + ',' + forca.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + tinta + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
    }

    // Sombra de contato no pe da parede. A altura dela ondula ao longo da sala
    // para nao virar uma faixa reta — sombra de verdade nao tem ponta.
    const fase1 = rnd() * Math.PI * 2;
    const fase2 = rnd() * Math.PI * 2;
    for (let x = 0; x < this.largura; x++) {
      const alturaSombra =
        104 + Math.sin(x / 190 + fase1) * 16 + Math.sin(x / 57 + fase2) * 7;
      const g = ctx.createLinearGradient(0, 0, 0, alturaSombra);
      g.addColorStop(0, 'rgba(0,0,0,0.80)');
      g.addColorStop(0.45, 'rgba(0,0,0,0.34)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, 1, alturaSombra);
    }

    // A borda da frente cai no escuro: e onde a sala termina.
    const fim = ctx.createLinearGradient(0, altura - 150, 0, altura);
    fim.addColorStop(0, 'rgba(0,0,0,0)');
    fim.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = fim;
    ctx.fillRect(0, altura - 150, this.largura, 150);

    textura.refresh();

    this.chao = this.cena.add
      .image(0, PROFUNDIDADE.FUNDO, chave)
      .setOrigin(0, 0)
      .setDepth(-30);
  }

  /** Cor media de uma faixa do piso da propria imagem, logo abaixo da parede. */
  corDoPiso() {
    const y = Math.min(this.fonteAltura - 2, this.config.linhaDoChao + 40);
    let r = 0, v = 0, b = 0, n = 0;

    for (let x = 8; x < this.fonteLargura; x += 17) {
      const cor = this.cena.textures.getPixel(x, y, this.config.chave);
      if (!cor) continue;
      r += cor.red; v += cor.green; b += cor.blue; n++;
    }
    if (!n) return '28,34,44';
    return Math.round(r / n) + ',' + Math.round(v / n) + ',' + Math.round(b / n);
  }

  /**
   * O desenho da sala, escalado para a linha do chao dele cair no lugar certo.
   * O pe da imagem se dissolve no chao gerado, para nao existir uma linha
   * horizontal marcando onde uma coisa acaba e a outra comeca.
   */
  montarDesenho() {
    this.desenho = this.cena.add
      .image(0, 0, this.config.chave)
      .setOrigin(0, 0)
      .setScale(this.escala)
      .setDepth(-20);

    // Faixa de dissolucao: some do desenho para o chao ao longo de 90 px.
    const chave = 'sala/' + this.config.chave + '/emenda';
    const altura = 90;
    if (!this.cena.textures.exists(chave)) {
      const textura = this.cena.textures.createCanvas(chave, 8, altura);
      const ctx = textura.getContext();
      const g = ctx.createLinearGradient(0, 0, 0, altura);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 8, altura);
      textura.refresh();
    }
    this.cena.add
      .image(0, PROFUNDIDADE.FUNDO - altura + 6, chave)
      .setOrigin(0, 0)
      .setDisplaySize(this.largura, altura)
      .setDepth(-19);

    // As laterais afundam no escuro: nao existe arte de parede lateral, entao
    // e a sombra que fecha a sala.
    const faixa = Math.min(360, this.largura * 0.22);
    const lados = this.cena.add.graphics().setDepth(-18);
    for (let i = 0; i < faixa; i++) {
      const forca = (1 - i / faixa) ** 1.6 * 0.7;
      lados.fillStyle(CORES.preto, forca);
      lados.fillRect(i, 0, 1, this.profundidade);
      lados.fillRect(this.largura - i - 1, 0, 1, this.profundidade);
    }
  }

  acenderLuzes() {
    const luzes = this.config.luzes ?? [
      { x: 0.5, y: 0.2, raio: 480, forca: 0.5 },
    ];
    for (const l of luzes) {
      this.iluminacao.adicionar(
        l.x * this.largura,
        PROFUNDIDADE.FUNDO + (l.y ?? 0.2) * (this.profundidade - PROFUNDIDADE.FUNDO),
        l.raio ?? 380,
        l.forca ?? 0.4
      );
    }
  }

  /** Converte uma coordenada X da imagem original para esta sala. */
  paraSala(xOriginal) {
    return Math.round(xOriginal * this.escala);
  }

  /** Converte uma coordenada Y da imagem original para o mundo. */
  paraMundo(yOriginal) {
    return Math.round(yOriginal * this.escala);
  }

  /** Coloca um objeto da folha de pecas no chao da sala. */
  porNoChao(chaveDaTextura, x, y, opcoes = {}) {
    const img = this.cena.add
      .image(x, y, chaveDaTextura)
      .setOrigin(0.5, 1)
      .setScale(opcoes.escala ?? 1)
      .setDepth(profundidadeDeDesenho(y) + (opcoes.acima ?? 0));
    return img;
  }

  /** Chamar a cada quadro com a posicao da Alice. */
  seguirComEscuridao(x, y) {
    this.iluminacao.seguir(x, y);
  }
}
