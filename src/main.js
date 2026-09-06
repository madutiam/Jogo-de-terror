/**
 * ALICE TERROR — ponto de entrada.
 *
 * O jogo e desenhado sempre em 960x640 (a mesma medida dos cenarios) e o Phaser
 * cuida de encaixar isso na tela do aparelho. Assim o mesmo codigo serve para
 * computador, notebook e celular, sem duas versoes de interface.
 */

import { GAME } from './core/constants.js';
import { CORES } from './ui/theme.js';

import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { TutorialScene } from './scenes/TutorialScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { CreditsScene } from './scenes/CreditsScene.js';
import { Phase1Scene } from './scenes/Phase1Scene.js';

const configuracao = {
  type: Phaser.AUTO,
  parent: 'jogo',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  backgroundColor: CORES.fundo,

  scale: {
    // NONE: o Phaser nao mexe no tamanho sozinho. Quem manda e `ajustarTela()`
    // logo abaixo — os modos automaticos (FIT deixa tarja preta, EXPAND se
    // perde quando o container muda sem a janela mudar) nao davam o resultado
    // que este jogo precisa.
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.NO_CENTER,
  },

  // Os desenhos sao de alta resolucao com aparencia de pixel art, e nao pixel
  // art de grade baixa. Filtro suave preserva melhor o traco quando a tela do
  // aparelho nao bate exatamente com 960x640.
  pixelArt: false,
  antialias: true,
  roundPixels: true,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },   // cada Alice define a propria; o mundo nao puxa nada
      debug: false,
    },
  },

  input: {
    activePointers: 3,     // analogico + botao + sobra
  },

  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    StoryScene,
    TutorialScene,
    SettingsScene,
    CreditsScene,
    Phase1Scene,
  ],
};

const jogo = new Phaser.Game(configuracao);

/**
 * O Phaser so remede o container quando a JANELA dispara resize. Isso deixa
 * passar varios casos reais: painel lateral do navegador abrindo, barra de
 * endereco do celular sumindo, janela encaixada pelo sistema. Quando isso
 * acontece o canvas fica com o tamanho antigo e sobra faixa preta na tela.
 *
 * O observador abaixo vigia o proprio container e manda o Phaser remedir.
 */
const container = document.getElementById('jogo');

/**
 * Dimensionamento na mao.
 *
 * A regra e simples e nunca falha: a ALTURA do jogo e sempre 640 unidades, e a
 * LARGURA vira o que precisar para bater exatamente com a proporcao da janela.
 * O canvas e esticado por CSS para 100% x 100% do container — e como a
 * proporcao ja bate, nao ha deformacao, nao ha tarja e nao ha corte.
 *
 * Na pratica:
 *   janela 16:9   -> 1138 x 640 unidades
 *   janela 3:2    ->  960 x 640
 *   janela 21:9   -> 1493 x 640
 *
 * O enquadramento vertical fica igual em todo aparelho; o que muda e quanto do
 * mundo se ve para os lados. Por isso nenhuma tela pode assumir 960 de largura
 * — todas perguntam o tamanho em `src/core/tela.js`.
 */
function ajustarTela() {
  // O canvas so existe depois que o Phaser termina o boot; esta funcao e
  // chamada tambem antes disso, por seguranca.
  if (!container || !jogo.canvas || !jogo.scale) return;

  const caixa = container.getBoundingClientRect();

  // Aba em segundo plano, painel recolhido ou janela minimizada reportam 0x0.
  // Um canvas de largura zero quebra o WebGL ("Framebuffer status: Incomplete
  // Attachment"), entao nesses casos nao mexemos em nada.
  if (caixa.width < 2 || caixa.height < 2) return;

  const largura = Math.max(320, Math.round(GAME.HEIGHT * (caixa.width / caixa.height)));

  if (jogo.scale.width !== largura || jogo.scale.height !== GAME.HEIGHT) {
    jogo.scale.resize(largura, GAME.HEIGHT);
  }

  // O Phaser nao mexe no CSS no modo NONE: o canvas preenche o container.
  jogo.canvas.style.width = '100%';
  jogo.canvas.style.height = '100%';
}

if (container && typeof ResizeObserver !== 'undefined') {
  let pendente = null;
  const observador = new ResizeObserver(() => {
    // Agrupa varias notificacoes seguidas numa so.
    if (pendente) cancelAnimationFrame(pendente);
    pendente = requestAnimationFrame(() => {
      pendente = null;
      ajustarTela();
    });
  });
  observador.observe(container);
}

window.addEventListener('resize', ajustarTela);
window.addEventListener('orientationchange', () => setTimeout(ajustarTela, 120));

// Quando a aba volta a aparecer, o tamanho so fica conhecido nesse momento.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) setTimeout(ajustarTela, 60);
});

jogo.events.once('ready', () => {
  ajustarTela();
  setTimeout(ajustarTela, 120);
});

ajustarTela();

// Util para inspecionar pelo console durante o desenvolvimento.
window.aliceTerror = jogo;
