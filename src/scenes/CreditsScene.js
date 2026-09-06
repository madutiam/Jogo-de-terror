/**
 * CREDITOS (regra 39): discretos.
 *
 * O cartao desenhado pela desenvolvedora ja traz tudo — nome, frase e o
 * "obrigado por jogar". Entao o jogo nao escreve nada por cima: so mostra a
 * arte, devagar, e deixa um VOLTAR discreto.
 *
 * Esta mesma arte e o cartao final depois da HIGHSFIELD 05.
 */

import { SCENES } from '../core/constants.js';
import { CORES, HEX, FONTE } from '../ui/theme.js';
import { AudioManager } from '../core/AudioManager.js';
import { dimensoes, remontarNoResize } from '../core/tela.js';
import { ArteSemCorte } from '../ui/ArteSemCorte.js';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super(SCENES.CREDITS);
  }

  create() {
    const tela = dimensoes(this);

    this.cameras.main.setBackgroundColor(CORES.preto);
    this.cameras.main.fadeIn(1400, 0, 0, 0);

    // O cartao entra INTEIRO. Antes ele era esticado ate cobrir a tela, e o
    // que sobrava era cortado — comendo o topo do titulo e o pe da Alice. Agora
    // ele cabe por completo e a sobra de tela e preenchida esticando a propria
    // beirada escura da arte, que nao tem desenho para deformar.
    const cartao = new ArteSemCorte(this, 'pos-creditos');
    this.cameras.main.setBackgroundColor(cartao.corDaBorda());
    cartao.encaixar(tela);
    for (const parte of cartao.partes) parte.setAlpha(0);

    this.tweens.add({
      targets: cartao.partes, alpha: 1, duration: 2200, ease: 'Quad.easeOut',
    });

    const voltar = this.add
      .text(tela.meioX, tela.altura - 22, 'VOLTAR', {
        fontFamily: FONTE, fontSize: '15px', color: HEX.ossoApagado,
      })
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: voltar, alpha: 0.75, duration: 900, delay: 2400 });

    voltar.on('pointerover', () => voltar.setColor(HEX.dourado));
    voltar.on('pointerout', () => voltar.setColor(HEX.ossoApagado));
    voltar.on('pointerdown', () => this.voltar());

    this.input.keyboard.on('keydown-ESC', () => this.voltar());
    this.input.keyboard.on('keydown-ENTER', () => this.voltar());

    // O tic-tac aqui nao e enfeite: e o gancho do pos-creditos.
    AudioManager.pararMusica(600);
    AudioManager.tocarAmbiente('ambiente.tictac', 2600);

    remontarNoResize(this);
  }

  voltar() {
    if (this.saindo) return;
    this.saindo = true;
    AudioManager.pararAmbiente(600);
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(SCENES.MENU));
  }
}
