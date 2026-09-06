/**
 * O MECANISMO DA SALA LATERAL
 *
 * Um mostrador de relogio embutido na parede, sem ponteiros. Os dois ponteiros
 * estao soltos, e a Alice pode gira-los.
 *
 * O QUE O JOGADOR PRECISA SABER — e onde ele aprende
 *
 * Nada aqui diz "acerte tres e dezessete". O numero vem de fora:
 *   - o relogio de parede do quarto principal esta parado em 03:17;
 *   - a despensa tem tres potes com um tres escrito em cada;
 *   - o relogio de pendulo desta mesma sala marca 03:18, um minuto depois.
 *
 * Quem juntou as tres coisas sabe o que fazer. Quem nao juntou fica girando os
 * ponteiros sem entender — e e assim que tem que ser (roteiro, secao 8: a
 * informacao esta no ambiente, e nao ha seta).
 *
 * Acertar derruba a escada quebrada no quarto principal. O enigma abre o
 * desafio fisico; sem ele, o sotao nao existe.
 */

import { CORES, HEX, FONTE } from '../ui/theme.js';
import { AudioManager } from '../core/AudioManager.js';
import { dimensoes } from '../core/tela.js';

/** A hora que destranca. Vem do relogio parado do quarto principal. */
export const HORA_CERTA = { hora: 3, minuto: 17 };

export class MecanismoDeRelogio {
  /**
   * @param {Phaser.Scene} cena
   * @param {() => void} aoResolver
   */
  constructor(cena, aoResolver) {
    this.cena = cena;
    this.aoResolver = aoResolver;
    this.aberto = false;
    this.resolvido = false;

    /** Posicao dos ponteiros: hora 0..11, minuto 0..59. */
    this.hora = 0;
    this.minuto = 0;
    /** Qual ponteiro responde as setas. */
    this.selecionado = 'hora';
  }

  abrir() {
    if (this.aberto || this.resolvido) return;
    this.aberto = true;

    const tela = dimensoes(this.cena);
    this.tela = tela;

    this.grupo = this.cena.add.container(0, 0).setScrollFactor(0).setDepth(1500);

    const fundo = this.cena.add
      .rectangle(tela.meioX, tela.meioY, tela.largura * 2, tela.altura * 2,
        CORES.preto, 0.88)
      .setScrollFactor(0);

    // O mostrador, grande no meio da tela.
    this.escala = Math.min(1.1, (tela.altura * 0.62) / 590);
    this.mostrador = this.cena.add
      .image(tela.meioX, tela.meioY, 'peca/mecanismo-0')
      .setScrollFactor(0)
      .setScale(this.escala);

    // O centro do mostrador, medido no desenho: o eixo dos ponteiros.
    this.eixoX = tela.meioX;
    this.eixoY = tela.meioY + 18 * this.escala;

    this.ponteiroHora = this.cena.add
      .image(this.eixoX, this.eixoY, 'peca/ponteiro-curto-0')
      .setScrollFactor(0)
      .setOrigin(0.5, 0.86)
      .setScale(this.escala * 0.72);

    this.ponteiroMinuto = this.cena.add
      .image(this.eixoX, this.eixoY, 'peca/ponteiro-longo-0')
      .setScrollFactor(0)
      .setOrigin(0.5, 0.88)
      .setScale(this.escala * 0.72);

    this.ajuda = this.cena.add
      .text(tela.meioX, tela.altura - 54, '', {
        fontFamily: FONTE, fontSize: '15px', color: HEX.ossoApagado, align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.grupo.add([fundo, this.mostrador, this.ponteiroHora, this.ponteiroMinuto, this.ajuda]);
    for (const parte of this.grupo.list) parte.setScrollFactor(0);

    this.atualizar();
    this.ligarTeclado();
  }

  ligarTeclado() {
    const teclado = this.cena.input.keyboard;
    this.aoTeclar = (evento) => {
      if (!this.aberto) return;
      const t = evento.key;

      if (t === 'ArrowLeft' || t === 'a' || t === 'A') this.girar(-1);
      else if (t === 'ArrowRight' || t === 'd' || t === 'D') this.girar(1);
      else if (t === 'ArrowUp' || t === 'ArrowDown' || t === 'w' || t === 's' ||
               t === 'W' || t === 'S' || t === 'Tab') {
        this.selecionado = this.selecionado === 'hora' ? 'minuto' : 'hora';
        AudioManager.tocarClac?.();
        this.atualizar();
      } else if (t === 'Escape') this.fechar();
      else if (t === 'e' || t === 'E' || t === 'Enter') this.conferir();

      evento.preventDefault?.();
    };
    teclado.on('keydown', this.aoTeclar);
  }

  girar(sentido) {
    if (this.selecionado === 'hora') {
      this.hora = (this.hora + sentido + 12) % 12;
    } else {
      this.minuto = (this.minuto + sentido + 60) % 60;
    }
    AudioManager.tocarClac?.();
    this.atualizar();
  }

  atualizar() {
    // 12 horas em 360 graus; 60 minutos em 360 graus. O ponteiro das horas
    // tambem avanca com os minutos, como num relogio de verdade.
    const grausHora = (this.hora + this.minuto / 60) * 30;
    const grausMinuto = this.minuto * 6;

    this.ponteiroHora.setAngle(grausHora);
    this.ponteiroMinuto.setAngle(grausMinuto);

    const marcado = this.selecionado === 'hora' ? this.ponteiroHora : this.ponteiroMinuto;
    const outro = this.selecionado === 'hora' ? this.ponteiroMinuto : this.ponteiroHora;
    marcado.setAlpha(1);
    outro.setAlpha(0.55);

    this.ajuda.setText(
      (this.selecionado === 'hora' ? 'ponteiro das horas' : 'ponteiro dos minutos') +
      '\n← → gira   ↑ ↓ troca de ponteiro   E confirma   ESC sai'
    );
  }

  conferir() {
    if (this.hora === HORA_CERTA.hora % 12 && this.minuto === HORA_CERTA.minuto) {
      this.acertou();
      return;
    }

    // Errou: o mecanismo range e volta ao lugar. Nao diz o que esta errado.
    AudioManager.tocar('efeito.rangido');
    this.cena.tweens.add({
      targets: [this.ponteiroHora, this.ponteiroMinuto],
      x: this.eixoX + 5,
      duration: 55, yoyo: true, repeat: 2,
      onComplete: () => {
        this.ponteiroHora.x = this.eixoX;
        this.ponteiroMinuto.x = this.eixoX;
      },
    });
  }

  acertou() {
    this.resolvido = true;
    AudioManager.tocar('efeito.descoberta');

    // As quatro variantes do desenho sao quatro estagios de brilho: o
    // mecanismo acende sozinho.
    let etapa = 0;
    const acender = this.cena.time.addEvent({
      delay: 190,
      repeat: 3,
      callback: () => {
        etapa++;
        this.mostrador.setTexture('peca/mecanismo-' + Math.min(3, etapa));
        if (etapa >= 3) {
          this.cena.time.delayedCall(700, () => {
            this.fechar();
            this.aoResolver?.();
          });
        }
      },
    });
    this.acendendo = acender;
  }

  fechar() {
    if (!this.aberto) return;
    this.aberto = false;
    this.cena.input.keyboard.off('keydown', this.aoTeclar);
    this.grupo.destroy(true);
    this.grupo = null;
  }
}
