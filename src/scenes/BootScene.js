/**
 * Primeira cena: prepara o basico e sai.
 *
 * A unica coisa que ela carrega e a arte da tela de carregamento — ela precisa
 * estar pronta ANTES do carregamento comecar, senao a tela de espera fica
 * vazia justo enquanto o jogador espera.
 */

import { SCENES } from '../core/constants.js';
import { CORES } from '../ui/theme.js';
import { AudioManager } from '../core/AudioManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  preload() {
    this.load.image('capa-coelho', 'assets/ui/capa-coelho.png');
  }

  create() {
    this.cameras.main.setBackgroundColor(CORES.fundo);
    AudioManager.registrar(this.game);

    // O navegador so libera audio depois de um gesto do jogador.
    // Phaser cuida disso, mas garantimos que a fila seja destravada.
    // O desbloqueio de audio agora mora no AudioManager, num ouvinte do
    // documento: aqui ele morria junto com esta cena, antes de a pessoa
    // chegar a clicar em qualquer coisa.

    this.scene.start(SCENES.PRELOAD);
  }
}
