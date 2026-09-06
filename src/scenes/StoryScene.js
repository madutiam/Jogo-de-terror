/**
 * Tela HISTORIA (regra 41): a introducao narrativa, sem entregar o final.
 *
 * Enquanto o texto rola, personagens emergem do preto atras dele e voltam a
 * sumir. Eles nao explicam nada — so aparecem perto do trecho a que pertencem,
 * fracos demais para serem confirmados. Cada um se move mais devagar que o
 * texto, entao parecem estar longe, dentro do escuro.
 *
 * Nenhum desenho foi alterado: sao os proprios PNGs, com opacidade baixa. A
 * cabeca do Gato e um recorte da arte original (feito no preload).
 *
 * Rolagem por roda do mouse, arraste (celular) e setas.
 */

import { SCENES } from '../core/constants.js';
import { dimensoes, remontarNoResize } from '../core/tela.js';
import { CORES, HEX, FONTE, ESTILO, comSombra } from '../ui/theme.js';
import { HISTORIA } from '../data/story.js';
import { AudioManager } from '../core/AudioManager.js';

const TOPO = 96;
const RODAPE = 74;
const ESPACO_PARAGRAFO = 14;

/**
 * Quem aparece, e em qual trecho.
 * `indice` e a posicao do paragrafo no texto de HISTORIA.
 * `altura` e a altura desejada em pixels de tela (a escala sai dai).
 */
const APARICOES = [
  // "— Coelho?" — a pergunta sem resposta.
  { chave: 'coelho', indice: 8, x: 252, altura: 358, opacidade: 0.26 },

  // "Uma respiracao." — alguma coisa atras dela. O Chapeleiro so observa.
  { chave: 'chapeleiro', indice: 22, x: 726, altura: 384, opacidade: 0.24 },

  // "Quase infantil. Quase familiar." — o sussurro.
  // Esta imagem e preta com os olhos e os dentes acesos. Desenhada em modo
  // ADD, o preto some por completo e so o brilho aparece: o sorriso nasce da
  // escuridao em vez de ficar colado por cima dela.
  { chave: 'gato-sorriso', indice: 34, x: 480, largura: 840, opacidade: 0.6, brilho: true },

  // "Os rastros." — quem passou por ali.
  { chave: 'soldado-cartas', indice: 44, x: 236, altura: 372, opacidade: 0.2 },

  // "E algumas historias..." — o que ainda esta por vir.
  { chave: 'alice-demon', indice: 52, x: 700, altura: 408, opacidade: 0.19 },
];

/** O quanto as figuras acompanham a rolagem. Menor = mais longe. */
const PARALAXE = 0.34;

export class StoryScene extends Phaser.Scene {
  constructor() {
    super(SCENES.STORY);
  }

  create() {
    this.cameras.main.setBackgroundColor(CORES.fundo);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.tela = dimensoes(this);
    this.areaVisivel = this.tela.altura - TOPO - RODAPE;
    this.centroLeitura = TOPO + this.areaVisivel / 2;

    this.add
      .text(this.tela.largura / 2, 46, 'HISTÓRIA', {
        fontFamily: FONTE, fontSize: '22px', color: HEX.dourado,
      })
      .setOrigin(0.5)
      .setAlpha(0.75);

    this.montarTexto();
    this.montarAparicoes();
    this.aplicarMascara();

    this.desvanecerBordas();
    this.montarRodape();
    this.ligarRolagem();

    this.rolagem = 0;
    this.atualizarAparicoes();

    // O tema da abertura acompanha a leitura inteira, baixo, com o silencio
    // tenso por baixo. Antes ele era cortado no segundo 6,2 e o resto da tela
    // ficava mudo.
    AudioManager.pararMusica(0);
    AudioManager.tocarMusica('musica.historia', 2200);
    AudioManager.tocarAmbiente('ambiente.silencio', 3000);

    remontarNoResize(this);
  }

  // --------------------------------------------------------------------- texto

  montarTexto() {
    this.conteudo = this.add.container(0, TOPO).setDepth(2);

    /** y de cada paragrafo dentro do conteudo — as aparicoes se ancoram neles. */
    this.alturaDoParagrafo = [];

    let y = 0;
    HISTORIA.forEach((paragrafo) => {
      const texto = this.add
        .text(this.tela.largura / 2, y, paragrafo, {
          ...comSombra(ESTILO.narrativa, 5),
          align: 'center',
          wordWrap: { width: 660 },
        })
        .setOrigin(0.5, 0);

      this.conteudo.add(texto);
      this.alturaDoParagrafo.push(y + texto.height / 2);
      y += texto.height + ESPACO_PARAGRAFO;
    });

    this.alturaTexto = y;
    this.rolagemMax = Math.max(0, this.alturaTexto - this.areaVisivel);
  }

  // ----------------------------------------------------------------- aparicoes

  montarAparicoes() {
    // Container proprio, atras do texto. Nao rola junto: cada figura e
    // posicionada a mao, com paralaxe.
    this.figuras = this.add.container(0, 0).setDepth(1);

    this.aparicoes = [];

    for (const config of APARICOES) {
      if (!this.textures.exists(config.chave)) {
        console.warn('[historia] textura ausente: ' + config.chave);
        continue;
      }

      const imagem = this.add.image(config.x, 0, config.chave).setAlpha(0);

      // `brilho` serve para imagens de fundo preto: em modo ADD o preto nao
      // soma nada e some, sobrando so a luz.
      if (config.brilho) imagem.setBlendMode(Phaser.BlendModes.ADD);

      // Escala pela altura ou pela largura desejada, sem distorcer:
      // os dois eixos recebem o mesmo fator.
      const fator = config.largura
        ? config.largura / imagem.width
        : config.altura / imagem.height;
      imagem.setScale(fator);

      this.figuras.add(imagem);

      // A ancora precisa ser alcancavel: os primeiros e os ultimos paragrafos
      // nunca chegam ao meio da area de leitura, porque a rolagem para antes.
      // Sem esse limite, a figura do fim do texto nunca apareceria.
      const folga = this.centroLeitura - TOPO;
      const ancora = Phaser.Math.Clamp(
        this.alturaDoParagrafo[config.indice] ?? 0,
        folga,
        this.rolagemMax + folga
      );

      this.aparicoes.push({ imagem, ancora, opacidade: config.opacidade });
    }
  }

  /**
   * Cada figura sobe pela tela mais devagar que o texto e so fica visivel
   * quando o trecho dela esta sendo lido.
   */
  atualizarAparicoes() {
    for (const aparicao of this.aparicoes) {
      const yDoTrecho = TOPO + aparicao.ancora - this.rolagem;
      const distancia = yDoTrecho - this.centroLeitura;

      aparicao.imagem.y = this.centroLeitura + distancia * PARALAXE;

      const alcance = this.areaVisivel * 0.9;
      const proximidade = Phaser.Math.Clamp(1 - Math.abs(distancia) / alcance, 0, 1);

      // Elevado ao cubo: a figura demora a nascer e some rapido — ela nunca
      // chega a ser confirmada.
      aparicao.imagem.setAlpha(proximidade ** 3 * aparicao.opacidade);
    }
  }

  aplicarMascara() {
    // Recorta texto e figuras na area de leitura, para nada invadir o titulo
    // nem o rodape.
    const forma = this.make.graphics({ add: false });
    forma.fillRect(0, TOPO, this.tela.largura, this.areaVisivel);
    const mascara = forma.createGeometryMask();

    this.conteudo.setMask(mascara);
    this.figuras.setMask(mascara);
  }

  // ------------------------------------------------------------------- visual

  /** Escurece o topo e a base da area de leitura: e onde tudo se dissolve. */
  desvanecerBordas() {
    const g = this.add.graphics().setDepth(5);
    const faixa = 46;

    for (let i = 0; i < faixa; i++) {
      const forca = 1 - i / faixa;
      g.fillStyle(CORES.fundo, forca * 0.16);
      g.fillRect(0, TOPO + i, this.tela.largura, 1);
      g.fillRect(0, this.tela.altura - RODAPE - i, this.tela.largura, 1);
    }
  }

  montarRodape() {
    const voltar = this.add
      .text(this.tela.largura / 2, this.tela.altura - 38, 'VOLTAR', comSombra(ESTILO.menu))
      .setOrigin(0.5)
      .setColor(HEX.ossoApagado)
      .setFontSize(20)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    voltar.on('pointerover', () => voltar.setColor(HEX.dourado));
    voltar.on('pointerout', () => voltar.setColor(HEX.ossoApagado));
    voltar.on('pointerdown', () => this.voltar());

    this.input.keyboard.on('keydown-ESC', () => this.voltar());
    this.input.keyboard.on('keydown-BACKSPACE', () => this.voltar());
  }

  // ----------------------------------------------------------------- rolagem

  ligarRolagem() {
    this.input.on('wheel', (ponteiro, objetos, dx, dy) => this.rolar(dy * 0.6));

    this.input.on('pointermove', (ponteiro) => {
      if (!ponteiro.isDown) return;
      this.rolar(-ponteiro.velocity.y * 0.35);
    });

    this.teclas = this.input.keyboard.addKeys({
      cima: Phaser.Input.Keyboard.KeyCodes.UP,
      baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
      pgUp: Phaser.Input.Keyboard.KeyCodes.PAGE_UP,
      pgDown: Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN,
    });
  }

  rolar(delta) {
    const antes = this.rolagem;
    this.rolagem = Phaser.Math.Clamp(this.rolagem + delta, 0, this.rolagemMax);
    if (this.rolagem === antes) return;

    this.conteudo.y = TOPO - this.rolagem;
    this.atualizarAparicoes();
  }

  update(tempo, delta) {
    const passo = (delta / 16.67) * 6;
    if (this.teclas.cima.isDown) this.rolar(-passo);
    if (this.teclas.baixo.isDown) this.rolar(passo);
    if (Phaser.Input.Keyboard.JustDown(this.teclas.pgUp)) this.rolar(-this.areaVisivel * 0.8);
    if (Phaser.Input.Keyboard.JustDown(this.teclas.pgDown)) this.rolar(this.areaVisivel * 0.8);
  }

  voltar() {
    AudioManager.pararAmbiente(500);
    this.cameras.main.fadeOut(320, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(SCENES.MENU));
  }
}
