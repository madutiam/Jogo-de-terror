/**
 * HIGHSFIELD 01 — O RELOGIO
 *
 * A cena de abertura, antes da Fase 1. Vinte segundos.
 *
 * Objetivo do roteiro (secao 32): mostrar Alice e o Coelho ANTES do
 * desaparecimento, e estabelecer o relogio como o elemento que importa.
 *
 * O intervalo de cada passo esta escrito no codigo com o mesmo numero do
 * roteiro, para dar para conferir cena e texto lado a lado.
 *
 * O que a cena NAO faz, de proposito:
 *   - nao usa a floresta destruida (o roteiro proibe);
 *   - nao inventa pose nenhuma: o Coelho tem exatamente os tres desenhos que a
 *     desenvolvedora entregou, e a Alice usa os quadros que existem;
 *   - nao toca musica. O relogio domina o som, como pede a secao 34.
 */

import { SCENES } from '../core/constants.js';
import { dimensoes } from '../core/tela.js';
import { CORES } from '../ui/theme.js';
import { AudioManager } from '../core/AudioManager.js';
import { SaveManager } from '../core/SaveManager.js';
import { Cinematica } from '../core/Cinematica.js';

export class Highsfield01Scene extends Phaser.Scene {
  constructor() {
    super(SCENES.HIGHSFIELD01);
  }

  create() {
    this.tela = dimensoes(this);
    this.cameras.main.setBackgroundColor(CORES.preto);
    this.cameras.main.fadeIn(2200, 0, 0, 0);

    this.montarCena();

    // O silencio primeiro. O tic-tac entra depois, e e ele que manda.
    AudioManager.pararMusica(0);
    AudioManager.tocarAmbiente('ambiente.silencio', 2000);

    this.montarLinhaDoTempo();
  }

  // ------------------------------------------------------------------- cena

  /**
   * Um comodo habitado, porem estranho: o proprio quarto, antes de tudo
   * acontecer. Mesa, cadeira, o relogio na parede. Luz baixa, sombra profunda.
   *
   * Tudo mora num container. A "camera" da cena e a escala e a posicao dele —
   * mexer no container e mais previsivel do que mexer no zoom da camera com o
   * mundo do tamanho da tela.
   */
  montarCena() {
    const { largura, altura, meioX, meioY } = this.tela;

    this.palco = this.add.container(meioX, meioY);

    const fundo = this.add.image(0, 0, 'fase1-quarto').setOrigin(0.5);
    // Cobre a tela sem esticar: o que sobra nas beiradas some no escuro.
    const escala = Math.max(largura / fundo.width, altura / fundo.height);
    fundo.setScale(escala);
    this.escalaDoFundo = escala;

    // Onde as duas figuras pisam, medido no desenho de 960x640.
    const chao = (480 - 320) * escala;
    const naArte = (x) => (x - 480) * escala;

    this.alice = this.add
      .image(naArte(360), chao, 'alice/grande-parada-0')
      .setOrigin(0.5, 1)
      .setScale(escala * 0.62);

    this.coelho = this.add
      .image(naArte(560), chao, 'coelho/relogio')
      .setOrigin(0.5, 1)
      .setScale(escala * 0.52);

    this.palco.add([fundo, this.alice, this.coelho]);

    // Escuridao por cima de tudo, menos de um halo em volta dos dois.
    this.montarPenumbra();

    // O close do relogio entra depois, por cima. E o proprio desenho dela do
    // relogio de bolso aberto, ja marcando 03:17.
    this.close = this.add
      .image(meioX, meioY, 'relogio-bolso-aberto')
      .setScale(Math.min(1, (altura * 0.72) / 428))
      .setAlpha(0)
      .setDepth(500);
  }

  montarPenumbra() {
    const chave = 'h01/penumbra';
    const lado = 1024;

    if (!this.textures.exists(chave)) {
      const textura = this.textures.createCanvas(chave, lado, lado);
      const ctx = textura.getContext();
      const meio = lado / 2;
      const g = ctx.createRadialGradient(meio, meio, meio * 0.18, meio, meio, meio * 0.52);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.62)');
      g.addColorStop(1, 'rgba(0,0,0,0.93)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, lado, lado);
      textura.refresh();
    }

    this.penumbra = this.add
      .image(this.tela.meioX, this.tela.meioY, chave)
      .setDepth(400);
    this.penumbra.setDisplaySize(this.tela.largura * 2.1, this.tela.altura * 2.4);
  }

  /** Aproxima o palco de um ponto, como uma camera que anda para a frente. */
  aproximar(alvoX, alvoY, escala, ms) {
    this.tweens.add({
      targets: this.palco,
      scaleX: escala, scaleY: escala,
      x: this.tela.meioX - alvoX * escala,
      y: this.tela.meioY - alvoY * escala,
      duration: ms,
      ease: 'Sine.easeInOut',
    });
  }

  // ------------------------------------------------------------- linha do tempo

  montarLinhaDoTempo() {
    const c = new Cinematica(this);

    // 0-3 s — a camera mostra lentamente o ambiente. Os dois tranquilos.
    this.aproximar(0, 0, 1.06, 3000);

    // 3-6 s — o Coelho olha para o relogio, depois para a Alice; ela percebe
    // e olha para ele; ele volta a olhar para o relogio.
    c.em(3000, () => this.coelho.setTexture('coelho/alice'));
    c.em(4200, () => {
      // A Alice vira para ele. Existe desenho de perfil, entao ela vira de
      // verdade — nada de espelhar o que ja esta certo.
      this.alice.setTexture('alice/anda-dir-0');
    });
    c.em(5400, () => this.coelho.setTexture('coelho/relogio'));

    // 6-9 s — comeca o TIC TAC, e a camera comeca a aproximar do relogio.
    c.em(6000, () => {
      AudioManager.pararAmbiente(600);
      AudioManager.tocarAmbiente('ambiente.tictac', 900);
      this.aproximar(this.coelho.x * 0.8, -40, 1.9, 3000);
    });

    // 9-12 s — close no relogio. Os ponteiros ainda funcionam.
    c.em(9000, () => {
      this.tweens.add({ targets: this.close, alpha: 1, duration: 900 });
      this.tweens.add({ targets: this.penumbra, alpha: 0.55, duration: 900 });
    });

    // 12-14 s — TIC. Silencio. O TAC nao acontece.
    c.em(12000, () => {
      AudioManager.pararAmbiente(120);
      AudioManager.tocarClac();
    });

    // 14-17 s — os dois percebem. A expressao muda. Nao e panico: e a sensacao
    // de que alguma coisa esta errada.
    c.em(14000, () => {
      this.tweens.add({ targets: this.close, alpha: 0, duration: 700 });
      this.tweens.add({ targets: this.penumbra, alpha: 1, duration: 700 });
      this.aproximar(0, 0, 1.24, 2600);
      this.coelho.setTexture('coelho/estranha');
    });
    c.em(15600, () => this.alice.setTexture('alice/grande-parada-0'));

    // 17-19 s — um ultimo TIC. O ponteiro se move de leve. Silencio.
    c.em(17000, () => AudioManager.tocarClac());

    // 19-20 s — corte para preto. O tic-tac continua um instante e some.
    c.em(19000, () => this.cameras.main.fadeOut(1200, 0, 0, 0));

    c.aoFim(20200, () => {
      AudioManager.silenciar({ fadeMs: 900 });
      SaveManager.registrarItem('viu-highsfield-01');
      this.scene.start(SCENES.PHASE1);
    });

    c.iniciar();
  }
}
