/**
 * Carrega tudo e prepara as texturas derivadas.
 * Barra de progresso discreta: um filete claro sobre fundo preto.
 */

import { SCENES } from '../core/constants.js';
import { dimensoes, escalaParaCaber } from '../core/tela.js';
import { CORES, HEX, FONTE } from '../ui/theme.js';
import { AUDIO_ARQUIVOS } from '../data/audio.js';
import { prepararTexturasDaAlice } from '../core/Alice.js';
import { recortarTextura } from '../core/texturas.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload() {
    this.desenharBarra();

    // ---- personagens ----
    this.load.image('alice-idle-frente', 'assets/characters/alice-idle-frente.png');
    this.load.image('alice-anda-direita', 'assets/characters/alice-anda-direita.png');
    this.load.image('alice-anda-esquerda', 'assets/characters/alice-anda-esquerda.png');
    // Andando para o fundo da cena: 0 parada, 1 a 4 o ciclo de caminhada.
    for (let i = 0; i < 5; i++) {
      this.load.image('alice-costas-' + i, 'assets/characters/alice-costas-' + i + '.png');
    }
    this.load.image('alice-demon', 'assets/characters/alice-demon.png');
    this.load.image('coelho', 'assets/characters/coelho.png');
    this.load.image('coelho-morto', 'assets/characters/coelho-morto.png');
    this.load.image('chapeleiro', 'assets/characters/chapeleiro.png');
    this.load.image('chapeleiro-fofo', 'assets/characters/chapeleiro-fofo.png');
    this.load.image('soldado-cartas', 'assets/characters/soldado-cartas.png');
    this.load.image('gato-cheshire', 'assets/characters/gato-cheshire.png');
    // Pixel art original do sorriso do Gato, feita para o jogo.
    this.load.image('gato-sorriso', 'assets/characters/gato-sorriso.png');

    // ---- cenarios ----
    this.load.image('fase1-quarto', 'assets/scenarios/fase1-quarto.png');
    this.load.image('fase2-floresta', 'assets/scenarios/fase2-floresta.png');
    this.load.image('fase3-tabuleiro', 'assets/scenarios/fase3-tabuleiro.png');

    // ---- objetos ----
    this.load.image('porta', 'assets/objects/porta.png');
    this.load.image('chave', 'assets/objects/chave.png');
    // O relogio de bolso do Coelho: o item que fecha a Fase 1 (roteiro, 9 e 11).
    this.load.image('relogio-bolso', 'assets/objects/relogio/relogio-bolso-0.png');
    this.load.image('relogio-bolso-aberto', 'assets/objects/relogio/relogio-bolso-aberto-0.png');

    // ---- interface ----
    this.load.image('capa', 'assets/ui/capa.png');
    // A capa larga vem sem o texto do menu: as opcoes de verdade sao
    // desenhadas pelo jogo, na mesma faixa da moldura.
    this.load.image('capa-larga', 'assets/ui/capa-larga-limpa.png');
    this.load.image('pos-creditos', 'assets/ui/tela-final.png');

    // ---- audio ----
    for (const [chave, caminho] of Object.entries(AUDIO_ARQUIVOS)) {
      this.load.audio(chave, [caminho]);
    }
  }

  create() {
    // Recorta os PNGs da Alice para o tamanho util, ja na escala de jogo.
    prepararTexturasDaAlice(this);

    this.scene.start(SCENES.MENU);
  }

  // ---------------------------------------------------------------------- ui

  desenharBarra() {
    const tela = dimensoes(this);
    const largura = Math.min(320, tela.largura * 0.4);
    const baseY = tela.altura - Math.round(tela.altura * 0.12);

    this.cameras.main.setBackgroundColor(CORES.fundo);

    // A arte do Coelho ocupa a tela de espera. Ela ja veio no Boot, entao
    // aparece de imediato, antes do carregamento pesado comecar.
    if (this.textures.exists('capa-coelho')) {
      const arte = this.add
        .image(tela.meioX, tela.meioY - tela.altura * 0.05, 'capa-coelho')
        .setAlpha(0);
      arte.setScale(escalaParaCaber(arte, tela.largura * 0.9, tela.altura * 0.86));
      this.tweens.add({ targets: arte, alpha: 1, duration: 1200 });
    }

    // Escurecimento no rodape, onde fica a barra.
    const faixa = Math.round(tela.altura * 0.22);
    const escuro = this.add.graphics();
    for (let i = 0; i < faixa; i++) {
      escuro.fillStyle(CORES.preto, (i / faixa) * 0.9);
      escuro.fillRect(0, tela.altura - faixa + i, tela.largura, 1);
    }

    const trilho = this.add.graphics();
    trilho.fillStyle(CORES.ossoMorto, 0.5);
    trilho.fillRect(tela.meioX - largura / 2, baseY, largura, 2);

    const barra = this.add.graphics();

    this.load.on('progress', (valor) => {
      barra.clear();
      barra.fillStyle(CORES.osso, 0.75);
      barra.fillRect(tela.meioX - largura / 2, baseY, largura * valor, 2);
    });

    this.load.on('fileprogress', (arquivo) => {
      // Nada na tela: silencio tambem no carregamento.
      if (arquivo?.key) this.ultimoArquivo = arquivo.key;
    });

    this.load.on('loaderror', (arquivo) => {
      console.error('[preload] falhou: ' + arquivo.key + ' (' + arquivo.url + ')');
    });
  }
}
