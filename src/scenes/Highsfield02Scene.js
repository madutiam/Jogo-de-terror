/**
 * HIGHSFIELD 02 — A PORTA
 *
 * Liga a Fase 1 a Fase 2. Vinte segundos. A Alice acaba de pegar o relogio
 * quebrado, e ele volta a andar.
 *
 * Uma decisao que vale explicar: nao existe desenho de porta ABERTA, e o
 * roteiro proibe inventar. Entao a porta nao se abre com animacao falsa — o que
 * abre e uma FRESTA DE LUZ no meio dela, que vai crescendo e revelando a
 * floresta atras. Som de porta antiga por cima. O desenho dela continua
 * intacto, e a leitura e a mesma.
 *
 * A Fase 2 ainda nao existe. A cena vai ate a Alice atravessar — que e onde o
 * roteiro manda cortar — e ai mostra o cartao de fim. Quando a floresta
 * existir, e so trocar o ultimo passo.
 */

import { SCENES } from '../core/constants.js';
import { dimensoes } from '../core/tela.js';
import { CORES, HEX, FONTE } from '../ui/theme.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { Cinematica } from '../core/Cinematica.js';
import { preencherBuracos } from '../core/texturas.js';

export class Highsfield02Scene extends Phaser.Scene {
  constructor() {
    super(SCENES.HIGHSFIELD02);
  }

  create() {
    this.tela = dimensoes(this);
    this.cameras.main.setBackgroundColor(CORES.preto);
    this.cameras.main.fadeIn(1400, 0, 0, 0);

    preencherBuracos(this, 'porta', 'porta/recorte', {
      x: 28, y: 37, largura: 352, altura: 573,
    });

    this.montarCena();

    AudioManager.pararMusica(0);
    AudioManager.tocarAmbiente('ambiente.silencio', 1500);

    this.montarLinhaDoTempo();
  }

  // -------------------------------------------------------------------- cena

  montarCena() {
    const { largura, altura, meioX } = this.tela;

    // A parede: um pedaco do proprio quarto, escuro.
    this.add
      .image(meioX, altura * 0.5, 'fase1-quarto')
      .setScale(Math.max(largura / 960, altura / 640) * 1.2)
      .setTint(0x5a6070);

    const baseDaPorta = altura * 0.86;
    this.escalaDaPorta = (altura * 0.66) / 573;

    this.centroDaPorta = meioX;
    this.topoDaPorta = baseDaPorta - 573 * this.escalaDaPorta;
    this.baseDaPorta = baseDaPorta;
    this.larguraDaFresta = 0;

    // A porta fechada. Ela nunca e deformada nem redesenhada: o que abre e a
    // fresta de luz por cima dela.
    this.porta = this.add
      .image(meioX, baseDaPorta, 'porta/recorte')
      .setOrigin(0.5, 1)
      .setScale(this.escalaDaPorta)
      .setDepth(10);

    // A fresta e um retangulo que cresce. Ela nao aparece em cena — serve so de
    // recorte para o que esta atras da porta. Um Graphics usado como mascara
    // CONTINUA se desenhando se ninguem o esconder; foi o que pintou uma barra
    // branca no meio da porta na primeira tentativa.
    this.fresta = this.add.graphics().setVisible(false);
    const recorte = this.fresta.createGeometryMask();

    // Atras da porta, primeiro, so escuridao (roteiro, 9-12 s).
    this.vao = this.add
      .rectangle(meioX, baseDaPorta - (573 * this.escalaDaPorta) / 2,
        largura, 573 * this.escalaDaPorta, CORES.preto)
      .setDepth(11)
      .setMask(recorte);

    // Depois a floresta aparece nela (12-15 s).
    this.floresta = this.add
      .image(meioX, baseDaPorta - (573 * this.escalaDaPorta) / 2, 'fase2-floresta')
      .setScale(Math.max(1, (573 * this.escalaDaPorta) / 640) * 1.1)
      .setAlpha(0)
      .setDepth(12)
      .setMask(recorte);

    // A Alice, de costas, diante da porta. E o desenho de costas dela —
    // a camera acompanha por tras, como o roteiro pede.
    this.alice = this.add
      .image(meioX, altura * 0.98, 'alice/costas-0')
      .setOrigin(0.5, 1)
      .setScale((altura * 0.30) / 253)
      .setDepth(20);

    // O close do relogio, que entra por cima quando a camera aproxima.
    this.close = this.add
      .image(meioX, altura * 0.46, 'relogio-bolso-aberto')
      .setScale(Math.min(0.9, (altura * 0.52) / 428))
      .setAlpha(0)
      .setDepth(500);

    this.escurecer = this.add
      .rectangle(0, 0, largura * 2, altura * 2, CORES.preto, 0)
      .setOrigin(0, 0)
      .setDepth(900);
  }

  /** Redesenha a fresta de luz no meio da porta, com a largura atual. */
  desenharFresta() {
    const alturaPorta = this.baseDaPorta - this.topoDaPorta;
    this.fresta.clear();
    this.fresta.fillStyle(0xffffff);
    this.fresta.fillRect(
      this.centroDaPorta - this.larguraDaFresta / 2,
      this.topoDaPorta + alturaPorta * 0.16,
      this.larguraDaFresta,
      alturaPorta * 0.78
    );
  }

  abrirFresta(ate, ms) {
    this.tweens.add({
      targets: this,
      larguraDaFresta: ate,
      duration: ms,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.desenharFresta(),
    });
  }

  // ------------------------------------------------------------- linha do tempo

  montarLinhaDoTempo() {
    const c = new Cinematica(this);
    const larguraMaxima = 352 * this.escalaDaPorta * 0.62;

    // 0-3 s — a Alice diante da porta que estava bloqueada. Ela tem o relogio,
    // e olha para ele.
    this.tweens.add({
      targets: this.alice, y: this.tela.altura * 0.94, duration: 2600,
      ease: 'Sine.easeOut',
    });

    // 3-6 s — o relogio comeca a fazer tic-tac. Mesmo quebrado.
    c.em(3000, () => {
      AudioManager.pararAmbiente(400);
      AudioManager.tocarAmbiente('ambiente.tictac', 800);
    });

    // 6-9 s — a camera aproxima do relogio. Ela olha para a porta.
    c.em(6000, () => {
      this.tweens.add({ targets: this.close, alpha: 1, duration: 1100 });
    });
    c.em(8400, () => {
      this.tweens.add({ targets: this.close, alpha: 0, duration: 800 });
    });

    // 9-12 s — a porta comeca a abrir. Atras dela, so escuridao.
    c.em(9200, () => {
      AudioManager.tocar('efeito.porta');
      this.abrirFresta(larguraMaxima * 0.35, 2400);
    });

    // 12-15 s — a abertura revela a floresta. Frio, galhos, um pouco de luz
    // distante. A Alice nao entra ainda.
    c.em(12000, () => {
      this.tweens.add({ targets: this.floresta, alpha: 1, duration: 1800 });
      this.abrirFresta(larguraMaxima, 2600);
      AudioManager.tocarAmbiente('ambiente.galhos', 2000);
    });

    // 15-18 s — ela da alguns passos, para, respira, e atravessa.
    c.em(15200, () => {
      this.tweens.add({
        targets: this.alice,
        y: this.tela.altura * 0.80,
        scale: this.alice.scale * 0.86,
        duration: 1500, ease: 'Sine.easeInOut',
      });
      AudioManager.iniciarLoop('passos.madeira');
    });
    c.em(16700, () => {
      AudioManager.pararLoop('passos.madeira');
      AudioManager.tocar('alice.respiracao');
    });
    c.em(17600, () => {
      this.tweens.add({
        targets: this.alice,
        y: this.topoDaPorta + (this.baseDaPorta - this.topoDaPorta) * 0.72,
        scale: this.alice.scale * 0.55,
        alpha: 0,
        duration: 1900, ease: 'Sine.easeIn',
      });
    });

    // 18-20 s — corte para a floresta.
    c.em(19000, () => {
      this.tweens.add({ targets: this.escurecer, fillAlpha: 1, duration: 1400 });
    });

    c.aoFim(20600, () => {
      SaveManager.salvarCheckpoint(1, 'fase1-concluida');
      SaveManager.registrarItem('viu-highsfield-02');
      this.mostrarFim();
    });

    c.iniciar();
  }

  /**
   * O cartao de fim. Fica aqui ate a Fase 2 existir — quando existir, este
   * metodo vira `this.scene.start(SCENES.PHASE2)` e nada mais muda.
   */
  mostrarFim() {
    const { meioX, meioY, largura, altura } = this.tela;

    this.add.rectangle(0, 0, largura * 2, altura * 2, CORES.preto)
      .setOrigin(0, 0).setDepth(2000);

    const fim = this.add
      .text(meioX, meioY - 12, 'FIM DA FASE 1', {
        fontFamily: FONTE, fontSize: '26px', color: HEX.osso,
      })
      .setOrigin(0.5).setDepth(2001).setAlpha(0);

    const nota = this.add
      .text(meioX, meioY + 26, 'a floresta ainda não existe', {
        fontFamily: FONTE, fontSize: '14px', color: HEX.ossoApagado,
      })
      .setOrigin(0.5).setDepth(2001).setAlpha(0);

    this.tweens.add({ targets: [fim, nota], alpha: 0.9, duration: 1600 });

    // O tic-tac continua sozinho no escuro por um instante.
    this.time.delayedCall(4200, () => {
      AudioManager.silenciar({ fadeMs: 900 });
      this.cameras.main.fadeOut(900, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete',
        () => this.scene.start(SCENES.MENU));
    });
  }
}
