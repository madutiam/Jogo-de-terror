/**
 * O PAINEL DE ABAS — inventario, diario, mapa e comandos
 *
 * Antes tudo isso era uma tela so, e ela ja tinha duas colunas brigando por
 * espaco. Com mapa e diario entrando, virava lista sem fim: quem abrisse para
 * reler uma pista teria que passar os olhos por cima dos comandos e do mapa.
 *
 * Aqui quem escolhe o que ver e o jogador. As abas nao tem estado proprio — o
 * conteudo de cada uma e montado na hora e destruido ao sair —, entao nenhuma
 * delas pode ficar desatualizada em relacao ao save.
 *
 * O painel e uma peca separada porque nao e da cena: e chrome. A GameplayScene
 * ja carrega fisica, dano, dialogo, pausa e checkpoint; nao precisa carregar
 * tambem o desenho de uma moldura.
 */

import { CORES, HEX, FONTE, ESTILO, comSombra } from './theme.js';
import { dimensoes } from '../core/tela.js';

/** Respiro entre a borda da tela e a moldura. */
const MARGEM = 34;
/** Altura da faixa de abas, medida do topo da moldura. */
const FAIXA = 62;

export class PainelDeAbas {
  /**
   * @param {Phaser.Scene} cena
   * @param {Array<{id:string, nome:string, montar:(area:object, painel:PainelDeAbas)=>void}>} abas
   * @param {{aoFechar?:Function}} [config]
   */
  constructor(cena, abas, config = {}) {
    this.cena = cena;
    this.abas = abas;
    this.aoFechar = config.aoFechar;
    this.atual = null;
    this.conteudo = null;
  }

  // --------------------------------------------------------------- abertura

  abrir(idInicial) {
    if (this.raiz) return;

    const tela = dimensoes(this.cena);
    this.tela = tela;

    this.raiz = this.cena.add.container(0, 0).setScrollFactor(0).setDepth(2100);

    // OPACO, e nao quase.
    //
    // A 0,94 a Alice aparecia atras do texto, no meio da tela, e o olho ficava
    // indo nela em vez de ler. Isto aqui nao e uma penumbra sobre o jogo: e uma
    // pagina que se abre na frente dele, e pagina nao e transparente.
    //
    // Bem maior que a tela porque, se o aparelho girar com o caderno aberto, o
    // preto continua cobrindo em vez de mostrar uma faixa do jogo na borda.
    const fundo = this.cena.add
      .rectangle(tela.meioX, tela.meioY, tela.largura * 2, tela.altura * 2, CORES.fundo, 1)
      .setScrollFactor(0)
      .setInteractive();   // engole cliques: nada atras do painel responde
    this.raiz.add(fundo);

    /** A area util, por dentro da moldura e abaixo da faixa de abas. */
    this.area = {
      x: MARGEM + 26,
      y: MARGEM + FAIXA + 14,
      largura: tela.largura - (MARGEM + 26) * 2,
      altura: tela.altura - MARGEM - FAIXA - 14 - MARGEM - 40,
    };

    this.desenharMoldura();
    this.montarFaixa();

    const primeira = idInicial && this.abas.some((a) => a.id === idInicial)
      ? idInicial
      : this.abas[0].id;
    this.trocarPara(primeira);
  }

  /**
   * Moldura em duas linhas, como as telas do jogo.
   *
   * A de fora e fina e apagada; a de dentro e mais clara e recuada. Duas linhas
   * finas dao a impressao de um livro velho, e uma linha grossa so, de caixa de
   * dialogo de sistema — que e justamente o que este jogo nao e.
   */
  desenharMoldura() {
    const { largura, altura } = this.tela;
    const g = this.cena.add.graphics().setScrollFactor(0);

    g.lineStyle(1, CORES.dourado, 0.30);
    g.strokeRect(MARGEM - 8, MARGEM - 8, largura - (MARGEM - 8) * 2, altura - (MARGEM - 8) * 2);

    g.lineStyle(1, CORES.dourado, 0.55);
    g.strokeRect(MARGEM, MARGEM, largura - MARGEM * 2, altura - MARGEM * 2);

    // O filete que separa as abas do conteudo. E o unico traco horizontal, e e
    // ele que faz a faixa de cima ler como faixa.
    g.lineStyle(1, CORES.dourado, 0.28);
    g.lineBetween(MARGEM + 18, MARGEM + FAIXA, largura - MARGEM - 18, MARGEM + FAIXA);

    this.raiz.add(g);
  }

  // ------------------------------------------------------------------- abas

  montarFaixa() {
    const { largura } = this.tela;
    this.rotulos = [];

    let x = MARGEM + 30;
    for (const aba of this.abas) {
      const rotulo = this.cena.add
        .text(x, MARGEM + FAIXA / 2 - 2, aba.nome.toUpperCase(), comSombra(ESTILO.menu))
        .setOrigin(0, 0.5)
        .setFontSize(19)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      rotulo.on('pointerover', () => {
        if (this.atual !== aba.id) rotulo.setColor(HEX.osso);
      });
      rotulo.on('pointerout', () => this.pintarFaixa());
      rotulo.on('pointerdown', () => this.trocarPara(aba.id));

      this.rotulos.push({ id: aba.id, rotulo });
      this.raiz.add(rotulo);
      x += rotulo.width + 40;
    }

    // ESC e VOLTAR, do outro lado. O ESC vem em caixinha porque e tecla, e a
    // palavra ao lado e o que se clica no celular, que nao tem tecla nenhuma.
    const voltar = this.cena.add
      .text(largura - MARGEM - 30, MARGEM + FAIXA / 2 - 2, 'VOLTAR', comSombra(ESTILO.menu))
      .setOrigin(1, 0.5)
      .setFontSize(17)
      .setColor(HEX.ossoApagado)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    voltar.on('pointerover', () => voltar.setColor(HEX.dourado));
    voltar.on('pointerout', () => voltar.setColor(HEX.ossoApagado));
    voltar.on('pointerdown', () => this.fechar());

    const tecla = this.cena.add
      .text(voltar.x - voltar.width - 14, MARGEM + FAIXA / 2 - 2, 'ESC', {
        fontFamily: FONTE, fontSize: '12px', color: HEX.ossoApagado,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    const caixa = this.cena.add
      .graphics()
      .lineStyle(1, CORES.ossoMorto, 1)
      .strokeRect(tecla.x - tecla.width - 7, tecla.y - 11, tecla.width + 14, 22)
      .setScrollFactor(0);

    this.raiz.add([caixa, tecla, voltar]);
    this.pintarFaixa();
  }

  /** A aba aberta fica em osso claro; as outras, apagadas. */
  pintarFaixa() {
    for (const { id, rotulo } of this.rotulos) {
      const aberta = id === this.atual;
      rotulo.setColor(aberta ? HEX.dourado : HEX.ossoMorto);
      rotulo.setAlpha(aberta ? 1 : 0.85);
    }
  }

  trocarPara(id) {
    if (this.atual === id) return;

    this.conteudo?.destroy(true);
    this.conteudo = this.cena.add.container(0, 0).setScrollFactor(0);
    this.raiz.add(this.conteudo);

    this.atual = id;
    this.pintarFaixa();

    const aba = this.abas.find((a) => a.id === id);
    aba?.montar(this.area, this);
  }

  /** Usado pelas abas para pendurar o que desenharem. */
  por(...objetos) {
    for (const o of objetos) o.setScrollFactor?.(0);
    this.conteudo.add(objetos);
    return objetos[0];
  }

  // ---------------------------------------------------------------- fechar

  get aberto() {
    return !!this.raiz;
  }

  fechar() {
    if (!this.raiz) return;
    this.raiz.destroy(true);
    this.raiz = null;
    this.conteudo = null;
    this.atual = null;
    this.aoFechar?.();
  }
}
