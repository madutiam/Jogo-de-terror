/**
 * Menu principal (regra 39): simples e sombrio.
 *
 * A capa larga e o menu. Ela preenche a tela inteira, sem tarja preta e sem
 * corte feio — o que sai nas beiradas e a moldura decorativa, que aguenta.
 * O titulo ja esta desenhado nela, entao o jogo nao escreve "ALICE TERROR" por
 * cima. As opcoes ficam numa linha so, no rodape, sobre um escurecimento.
 *
 * Nada aqui assume 960x640: o tamanho vem de `tela.js` e a cena se remonta se
 * o aparelho girar.
 */

import { SCENES } from '../core/constants.js';
import { CORES, HEX, FONTE, ESTILO, comSombra } from '../ui/theme.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { dimensoes, aoRedimensionar, escalaParaCaber } from '../core/tela.js';
import { recortarTextura } from '../core/texturas.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  create() {
    this.tela = dimensoes(this);

    this.montarCapa();
    this.montarOpcoes();
    this.ligarTeclado();

    AudioManager.tocarMusica('musica.menu', 2400);

    this.versao = this.add
      .text(0, 0, 'v0.1', { fontFamily: FONTE, fontSize: '12px', color: HEX.ossoMorto })
      .setOrigin(1, 1)
      .setAlpha(0.5);

    // Nada de remontar a cena: aqui o layout inteiro sabe se recalcular, entao
    // girar o aparelho ou mudar o tamanho da janela nao pisca nem reinicia a
    // musica. Uma reposicionada logo apos o create cobre o caso em que o
    // tamanho real so fica conhecido no quadro seguinte.
    aoRedimensionar(this, (tela) => this.reposicionar(tela));
    this.time.delayedCall(0, () => this.reposicionar(dimensoes(this)));
  }

  /** Reencaixa tudo num tamanho de tela novo. */
  reposicionar(tela) {
    if (!this.capa) return;

    this.tela = tela;
    this.encaixarCapa();

    this.versao.setPosition(tela.largura - 14, tela.altura - 10);

    for (const losango of this.separadores) losango.destroy();
    this.separadores = [];
    this.distribuir();
    this.selecionar(this.selecionado);
  }

  // --------------------------------------------------------------------- capa

  /**
   * Pontos de referencia dentro da arte, em fracao da imagem.
   * A moldura da capa tem uma faixa reservada embaixo — e nela que o menu
   * mora. Ancorando por aqui, o menu cai no lugar certo em qualquer tela,
   * mesmo quando a arte e cortada nas beiradas.
   */
  static ANCORAS = {
    faixaDoMenu: 0.918,
    // Nao e a borda da moldura, e o fim dos ornamentos dela: as colunas e as
    // rosas ocupam os primeiros e os ultimos ~100px da arte, e o texto nao
    // pode encostar neles.
    bordaEsquerda: 0.118,
    bordaDireita: 0.882,
    // O medalhao desce ate a faixa do menu com a portinha e a fechadura.
    // Este vao no meio e o espaco dele: as opcoes se dividem em volta.
    vaoEsquerda: 0.40,
    vaoDireita: 0.60,
  };

  montarCapa() {
    // O fundo recebe a cor do canto da propria arte. Assim, se em alguma
    // proporcao extrema sobrar um fio de borda, ele nao aparece como preto
    // chapado — some dentro da arte.
    this.cameras.main.setBackgroundColor(this.corDaBorda());

    // Fatias das quatro beiradas da capa. Elas esticam para preencher o que
    // sobrar da tela — como a beirada da arte e escuro liso, a emenda some.
    recortarTextura(this, 'capa-larga', 'capa/beiraEsq', { x: 0, y: 0, largura: 8, altura: 941 });
    recortarTextura(this, 'capa-larga', 'capa/beiraDir', { x: 1664, y: 0, largura: 8, altura: 941 });
    recortarTextura(this, 'capa-larga', 'capa/beiraTopo', { x: 0, y: 0, largura: 1672, altura: 8 });
    recortarTextura(this, 'capa-larga', 'capa/beiraBase', { x: 0, y: 933, largura: 1672, altura: 8 });

    this.beiras = {
      esq: this.add.image(0, 0, 'capa/beiraEsq').setOrigin(1, 0.5),
      dir: this.add.image(0, 0, 'capa/beiraDir').setOrigin(0, 0.5),
      topo: this.add.image(0, 0, 'capa/beiraTopo').setOrigin(0.5, 1),
      base: this.add.image(0, 0, 'capa/beiraBase').setOrigin(0.5, 0),
    };

    this.capa = this.add.image(0, 0, 'capa-larga');
    this.encaixarCapa();

    const tudo = [this.capa, ...Object.values(this.beiras)];
    for (const parte of tudo) parte.setAlpha(0);
    this.tweens.add({ targets: tudo, alpha: 1, duration: 1600, ease: 'Quad.easeOut' });
  }

  /**
   * A capa entra INTEIRA — nada de corte. O topo do medalhao e a faixa do
   * menu embaixo sao os dois igualmente importantes, entao nenhum dos dois
   * pode sair de quadro. O que sobra de tela nas beiradas e preenchido
   * esticando a propria borda da arte, que e escuro liso.
   */
  encaixarCapa() {
    const { largura, altura, meioX, meioY } = this.tela;
    const A = MenuScene.ANCORAS;

    const escala = escalaParaCaber(this.capa, largura, altura);
    const larguraArte = this.capa.width * escala;
    const alturaArte = this.capa.height * escala;

    this.capa.setPosition(meioX, meioY).setScale(escala);

    // Sobras a preencher, se houver.
    const sobraX = Math.max(0, (largura - larguraArte) / 2) + 2;
    const sobraY = Math.max(0, (altura - alturaArte) / 2) + 2;

    this.beiras.esq
      .setPosition(meioX - larguraArte / 2 + 1, meioY)
      .setDisplaySize(sobraX, alturaArte);
    this.beiras.dir
      .setPosition(meioX + larguraArte / 2 - 1, meioY)
      .setDisplaySize(sobraX, alturaArte);
    this.beiras.topo
      .setPosition(meioX, meioY - alturaArte / 2 + 1)
      .setDisplaySize(largura, sobraY);
    this.beiras.base
      .setPosition(meioX, meioY + alturaArte / 2 - 1)
      .setDisplaySize(largura, sobraY);

    const naArteX = (f) => meioX + (f - 0.5) * larguraArte;
    const naArteY = (f) => meioY + (f - 0.5) * alturaArte;

    this.rodapeY = naArteY(A.faixaDoMenu);
    this.limiteEsquerdo = naArteX(A.bordaEsquerda);
    this.limiteDireito = naArteX(A.bordaDireita);
    this.vaoEsquerda = naArteX(A.vaoEsquerda);
    this.vaoDireita = naArteX(A.vaoDireita);
  }

  /** Cor do canto da capa, lida da propria imagem. */
  corDaBorda() {
    const cor = this.textures.getPixel(6, 6, 'capa-larga');
    if (!cor) return CORES.preto;
    return (cor.red << 16) | (cor.green << 8) | cor.blue;
  }

  // ------------------------------------------------------------------ opcoes

  /** Tamanho de fonte das opcoes, antes de qualquer aperto. */
  static TAMANHO_OPCAO = 21;
  /** Espaco entre uma opcao e a proxima, e o minimo que ele pode ceder. */
  static RESPIRO = 40;
  static RESPIRO_MINIMO = 18;

  montarOpcoes() {
    const temProgresso = SaveManager.temProgresso();

    this.opcoes = [
      { texto: temProgresso ? 'CONTINUAR' : 'JOGAR', acao: () => this.jogar() },
      { texto: 'HISTÓRIA', acao: () => this.irPara(SCENES.STORY) },
      { texto: 'TUTORIAL', acao: () => this.irPara(SCENES.TUTORIAL) },
      { texto: 'CONFIGURAÇÕES', acao: () => this.irPara(SCENES.SETTINGS) },
      { texto: 'CRÉDITOS', acao: () => this.irPara(SCENES.CREDITS) },
    ];

    if (temProgresso) {
      this.opcoes.push({ texto: 'RECOMEÇAR', acao: () => this.recomecar() });
    }

    const estilo = { ...comSombra(ESTILO.menu, 6), fontSize: MenuScene.TAMANHO_OPCAO + 'px' };
    this.itens = this.opcoes.map((opcao) =>
      this.add.text(0, this.rodapeY, opcao.texto, estilo).setOrigin(0.5).setAlpha(0)
    );

    this.separadores = [];
    this.distribuir();

    this.itens.forEach((item, indice) => {
      // Area de toque maior que o texto: no celular o dedo precisa de folga.
      item.setInteractive(
        new Phaser.Geom.Rectangle(-16, -18, item.width + 32, item.height + 36),
        Phaser.Geom.Rectangle.Contains
      );
      item.input.cursor = 'pointer';

      item.on('pointerover', () => this.selecionar(indice));
      item.on('pointerdown', () => { this.selecionar(indice); this.confirmar(); });

      this.tweens.add({ targets: item, alpha: 1, duration: 700, delay: 1200 + indice * 90 });
    });

    this.selecionado = 0;
    this.selecionar(0);
  }

  /**
   * As opcoes ficam nas duas laterais da faixa, deixando o meio livre para a
   * portinha do medalhao. Espalhar tudo na largura inteira fazia o texto passar
   * por cima do desenho.
   */
  distribuir() {
    const metade = Math.ceil(this.itens.length / 2);
    const esquerda = this.itens.slice(0, metade);
    const direita = this.itens.slice(metade);

    // Espaco util de cada lado: da borda da moldura ate o vao do medalhao.
    const vaoEsq = this.vaoEsquerda - this.limiteEsquerdo;
    const vaoDir = this.limiteDireito - this.vaoDireita;

    // Quando ha progresso salvo o menu ganha CONTINUAR e RECOMECAR: seis
    // opcoes em vez de quatro. Com o respiro fixo os dois grupos cresciam ate
    // se encontrarem no meio e as palavras ficavam uma por cima da outra.
    // Aqui o respiro cede primeiro; se ainda nao couber, a fonte diminui — e
    // diminui IGUAL nos dois lados, senao o menu fica torto.
    const respiro = Math.min(
      this.respiroQueCabe(esquerda, vaoEsq),
      this.respiroQueCabe(direita, vaoDir)
    );
    const fator = Math.min(
      this.fatorQueCabe(esquerda, vaoEsq, respiro),
      this.fatorQueCabe(direita, vaoDir, respiro)
    );
    if (fator < 1) {
      const tamanho = Math.max(14, Math.floor(MenuScene.TAMANHO_OPCAO * fator));
      for (const item of this.itens) item.setFontSize(tamanho);
    }

    // Cada grupo encosta na sua borda da moldura, nao no meio: e o que deixa a
    // portinha do medalhao respirar.
    this.posicionarGrupo(esquerda, this.limiteEsquerdo, 'esquerda', respiro);
    this.posicionarGrupo(direita, this.limiteDireito, 'direita', respiro);
  }

  /** O maior respiro que ainda deixa o grupo caber no espaco dele. */
  respiroQueCabe(itens, largura) {
    if (itens.length < 2) return MenuScene.RESPIRO;
    const soma = itens.reduce((total, item) => total + item.width, 0);
    const sobra = (largura - soma) / (itens.length - 1);
    return Math.max(MenuScene.RESPIRO_MINIMO, Math.min(MenuScene.RESPIRO, sobra));
  }

  /** Quanto a fonte precisa encolher para o grupo caber. 1 = nao precisa. */
  fatorQueCabe(itens, largura, respiro) {
    if (itens.length === 0) return 1;
    const soma = itens.reduce((total, item) => total + item.width, 0);
    const total = soma + respiro * (itens.length - 1);
    return total <= largura ? 1 : largura / total;
  }

  /**
   * Enfileira um punhado de opcoes a partir de uma borda, com losangos entre
   * elas.
   *
   * @param {'esquerda'|'direita'} lado de onde o grupo cresce
   */
  posicionarGrupo(itens, borda, lado, respiro = MenuScene.RESPIRO) {
    if (itens.length === 0) return;

    const soma = itens.reduce((total, item) => total + item.width, 0);
    const total = soma + respiro * (itens.length - 1);
    let x = lado === 'esquerda' ? borda : borda - total;

    itens.forEach((item, i) => {
      item.setPosition(Math.round(x + item.width / 2), this.rodapeY);
      x += item.width;

      if (i < itens.length - 1) {
        const losango = this.add
          .text(Math.round(x + respiro / 2), this.rodapeY, '◆', {
            fontFamily: FONTE, fontSize: '10px', color: HEX.dourado,
          })
          .setOrigin(0.5)
          .setAlpha(0.32);
        this.separadores.push(losango);
        x += respiro;
      }
    });
  }

  // ------------------------------------------------------------------ navegacao

  ligarTeclado() {
    const teclado = this.input.keyboard;

    teclado.on('keydown-LEFT', () => this.mover(-1));
    teclado.on('keydown-A', () => this.mover(-1));
    teclado.on('keydown-RIGHT', () => this.mover(1));
    teclado.on('keydown-D', () => this.mover(1));
    teclado.on('keydown-ENTER', () => this.confirmar());
    teclado.on('keydown-SPACE', () => this.confirmar());
    teclado.on('keydown-E', () => this.confirmar());
  }

  mover(passo) {
    const total = this.itens.length;
    this.selecionar((this.selecionado + passo + total) % total);
  }

  selecionar(indice) {
    this.selecionado = indice;

    this.itens.forEach((item, i) => {
      // A opcao sob o cursor acende em dourado — a mesma cor dos detalhes da
      // moldura e dos losangos, entao o realce parece parte da arte.
      item.setColor(i === indice ? HEX.dourado : HEX.ossoApagado);
    });
  }

  confirmar() {
    if (this.saindo) return;
    this.opcoes[this.selecionado].acao();
  }

  // --------------------------------------------------------------------- acoes

  irPara(cena) {
    this.saindo = true;
    this.cameras.main.fadeOut(320, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.saindo = false;
      this.scene.start(cena);
    });
  }

  jogar() {
    this.saindo = true;
    AudioManager.pararMusica(900);
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.saindo = false;

      // JOGAR do zero entra pela HIGHSFIELD 01, que e a abertura da historia.
      // CONTINUAR pula ela: quem ja viu nao precisa rever a cada morte.
      const jaViu = SaveManager.temItem('viu-highsfield-01');
      this.scene.start(jaViu ? SCENES.PHASE1 : SCENES.HIGHSFIELD01);
    });
  }

  recomecar() {
    SaveManager.apagarProgresso();
    this.scene.restart();
  }
}
