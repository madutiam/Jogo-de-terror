/**
 * UMA LINHA DO TEMPO PARA AS CINEMATICAS
 *
 * O roteiro descreve as HIGHSFIELD por intervalo de segundos — "3 a 6 s: o
 * Coelho olha para o relogio", "12 a 14 s: o relogio para". Esta peca deixa o
 * codigo ficar com essa mesma forma, para dar para conferir cena e roteiro lado
 * a lado sem traduzir nada.
 *
 *     const c = new Cinematica(cena);
 *     c.em(3000, () => coelho.olharParaORelogio());
 *     c.em(6000, () => AudioManager.tocarAmbiente('ambiente.tictac'));
 *     c.aoFim(20000, () => this.scene.start(SCENES.PHASE1));
 *     c.iniciar();
 *
 * O jogador pode pular com ESC ou ENTER. Pular NAO e devolver o controle no
 * meio: e ir direto para o fim, executando o que faltava — assim o estado do
 * jogo depois da cena e sempre o mesmo, tenha ela sido vista ou nao.
 */

import { HEX, FONTE } from '../ui/theme.js';
import { dimensoes } from '../core/tela.js';

export class Cinematica {
  /**
   * @param {Phaser.Scene} cena
   * @param {{podePular?: boolean}} opcoes
   */
  constructor(cena, opcoes = {}) {
    this.cena = cena;
    this.passos = [];
    this.fim = null;
    this.duracao = 0;
    this.rodando = false;
    this.podePular = opcoes.podePular !== false;
  }

  /** @param {number} aos  milissegundos desde o inicio */
  em(aos, faz) {
    this.passos.push({ aos, faz, feito: false });
    this.duracao = Math.max(this.duracao, aos);
    return this;
  }

  /** O ultimo passo. Tambem e para onde o ESC leva. */
  aoFim(aos, faz) {
    this.fim = { aos, faz, feito: false };
    this.duracao = Math.max(this.duracao, aos);
    return this;
  }

  iniciar() {
    this.rodando = true;
    this.comecouEm = this.cena.time.now;

    for (const passo of this.passos) {
      passo.timer = this.cena.time.delayedCall(passo.aos, () => {
        passo.feito = true;
        passo.faz();
      });
    }
    if (this.fim) {
      this.fim.timer = this.cena.time.delayedCall(this.fim.aos, () => {
        this.fim.feito = true;
        this.fim.faz();
      });
    }

    if (this.podePular) this.montarAviso();
    return this;
  }

  /**
   * Vai direto para o fim. Tudo que ainda nao aconteceu acontece agora, de uma
   * vez — inclusive o que grava progresso. Uma cena pulada nao pode deixar o
   * jogo em estado diferente de uma cena vista.
   */
  pular() {
    if (!this.rodando) return;
    this.rodando = false;

    for (const passo of this.passos) {
      passo.timer?.remove();
      if (!passo.feito) { passo.feito = true; passo.faz(); }
    }
    this.aviso?.destroy();

    if (this.fim && !this.fim.feito) {
      this.fim.timer?.remove();
      this.fim.feito = true;
      this.fim.faz();
    }
  }

  /** "ESC para pular", discreto, some sozinho. */
  montarAviso() {
    const tela = dimensoes(this.cena);

    this.aviso = this.cena.add
      .text(tela.largura - 22, tela.altura - 20, 'ESC', {
        fontFamily: FONTE, fontSize: '13px', color: HEX.ossoMorto,
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(3000)
      .setAlpha(0);

    this.cena.tweens.add({
      targets: this.aviso, alpha: 0.5, duration: 900, delay: 1600,
      yoyo: true, hold: 2600,
    });

    const teclado = this.cena.input.keyboard;
    const pular = () => this.pular();
    teclado.once('keydown-ESC', pular);
    teclado.once('keydown-ENTER', pular);
    this.cena.input.once('pointerdown', pular);
  }
}
