/**
 * HUD de vida (regra 35): espadas, nunca coracoes.
 *
 *   ♠ ♠ ♠   ->   ♠ ♠   ->   ♠   ->   morte / checkpoint
 *
 * Discreto de proposito: canto superior esquerdo, opacidade baixa, sem moldura,
 * sem cor viva. So chama atencao no instante em que uma espada se apaga.
 */

import { VIDAS_INICIAIS } from '../core/constants.js';
import { ESTILO, HEX, comSombra } from './theme.js';

export class Hud {
  /**
   * @param {Phaser.Scene} cena
   * @param {number} vidas
   */
  constructor(cena, vidas = VIDAS_INICIAIS) {
    this.cena = cena;
    this.maximo = vidas;
    this.vidas = vidas;

    this.container = cena.add.container(0, 0).setScrollFactor(0, 0, true).setDepth(1000);

    this.espadas = [];
    for (let i = 0; i < this.maximo; i++) {
      const espada = cena.add
        .text(26 + i * 30, 22, '♠', comSombra(ESTILO.hud))
        .setAlpha(0.86);
      this.espadas.push(espada);
      this.container.add(espada);
      espada.setScrollFactor(0);
    }
  }

  /** Quantas espadas acesas. Nao deixa passar do maximo nem de zero. */
  definirVidas(valor) {
    const novo = Phaser.Math.Clamp(valor, 0, this.maximo);
    if (novo === this.vidas) return;

    const perdeu = novo < this.vidas;
    this.vidas = novo;
    this.redesenhar(perdeu);
  }

  perderVida() {
    this.definirVidas(this.vidas - 1);
    return this.vidas;
  }

  ganharVida() {
    this.definirVidas(this.vidas + 1);
    return this.vidas;
  }

  redesenhar(animarPerda) {
    this.espadas.forEach((espada, indice) => {
      const acesa = indice < this.vidas;

      // Cancela qualquer animacao pendente antes de redefinir o estado,
      // senao uma espada reacesa continua desaparecendo pelo tween antigo.
      this.cena.tweens.killTweensOf(espada);

      if (acesa) {
        espada.setColor(HEX.osso).setAlpha(0.86).setX(26 + indice * 30);
        return;
      }

      if (animarPerda && espada.alpha > 0.3) {
        // A espada que acabou de apagar: um tranco curto e some.
        this.cena.tweens.add({
          targets: espada,
          x: espada.x + 4,
          duration: 55,
          yoyo: true,
          repeat: 2,
        });
        this.cena.tweens.add({
          targets: espada,
          alpha: 0.16,
          duration: 420,
          ease: 'Quad.easeOut',
          onStart: () => espada.setColor(HEX.ossoMorto),
        });
      } else {
        espada.setColor(HEX.ossoMorto).setAlpha(0.16);
      }
    });
  }

  esconder() {
    this.container.setVisible(false);
  }

  mostrar() {
    this.container.setVisible(true);
  }

  /** Some suavemente — usado nas cinematicas. */
  desvanecer(ms = 400) {
    this.cena.tweens.add({ targets: this.container, alpha: 0, duration: ms });
  }

  reaparecer(ms = 400) {
    this.container.setVisible(true);
    this.cena.tweens.add({ targets: this.container, alpha: 1, duration: ms });
  }

  destroy() {
    this.container.destroy();
  }
}
