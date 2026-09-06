/**
 * Numeros e chaves que o jogo inteiro compartilha.
 * Se um valor aparece em mais de um lugar, o lugar dele e aqui.
 */

/** Resolucao de desenho. Igual a dos cenarios (960x640): fundo 1:1, sem reescalar. */
export const GAME = {
  WIDTH: 960,
  HEIGHT: 640,
};

export const SCENES = {
  BOOT: 'Boot',
  PRELOAD: 'Preload',
  MENU: 'Menu',
  STORY: 'Story',
  TUTORIAL: 'Tutorial',
  SETTINGS: 'Settings',
  CREDITS: 'Credits',
  PHASE1: 'Phase1',
};

/**
 * Movimento no plano do chao.
 *
 * O jogo nao e plataforma lateral: a Alice anda livre pelo chao, para os lados
 * E para o fundo. A tela mostra esse chao em perspectiva, entao andar para cima
 * significa se afastar da camera.
 *
 * O pulo existe num eixo separado — `altura` — que so desloca o desenho para
 * cima e encolhe a sombra. E o que permite subir na mobilia e atravessar vaos
 * sem transformar o jogo em plataforma.
 */
export const PHYSICS = {
  WALK_SPEED: 150,
  RUN_SPEED: 250,
  /** Aceleracao alta = arranca e para sem patinar. */
  ACCELERATION: 2400,
  DRAG: 2800,

  /** Pulo: impulso e gravidade do eixo de altura (nao do chao). */
  IMPULSO_PULO: 750,
  GRAVIDADE_PULO: 2200,
  /** Pulo memorizado se apertar um pouco antes de encostar (ms). */
  JUMP_BUFFER: 130,
  /** Soltar o botao no meio da subida corta o pulo. */
  JUMP_CUT: 0.45,
};

/**
 * Perspectiva do chao.
 *
 * FUNDO e a linha onde o chao encosta na parede do fundo; FRENTE e a borda do
 * chao mais perto da camera. A escala da Alice cresce entre as duas — e o que
 * da a sensacao de profundidade. A ordem de desenho tambem sai daqui: quem
 * esta mais para a frente aparece na frente.
 */
export const PROFUNDIDADE = {
  FUNDO: 470,
  FRENTE: 1180,
  ESCALA_FUNDO: 0.58,
  ESCALA_FRENTE: 0.80,
};

/** Escala de um objeto pousado no chao, pela profundidade dele. */
export function escalaPorProfundidade(y) {
  const t = Phaser.Math.Clamp(
    (y - PROFUNDIDADE.FUNDO) / (PROFUNDIDADE.FRENTE - PROFUNDIDADE.FUNDO),
    0, 1
  );
  return Phaser.Math.Linear(PROFUNDIDADE.ESCALA_FUNDO, PROFUNDIDADE.ESCALA_FRENTE, t);
}

/** Ordem de desenho de quem pisa no chao. Divide para nao brigar com a HUD. */
export function profundidadeDeDesenho(y) {
  return 10 + y / 10;
}

/**
 * A Alice esta desenhada dentro de PNGs de 500x500 com muita area vazia em volta.
 * Estes numeros vem da medicao do conteudo real de cada arquivo.
 *
 *   TOPO/PES  — linha do topo da cabeca e linha dos pes, em pixels da textura
 *   cx        — centro horizontal do desenho, em pixels da textura
 *
 * Os tres frames tem os pes na mesma altura, entao trocar de textura nao faz a
 * Alice subir nem descer. No preload recortamos exatamente esta janela e ja
 * gravamos na escala final — assim a origem fica em (0.5, 1) e a colisao fica
 * previsivel, sem depender de offset dentro de um PNG cheio de vazio.
 */
export const ALICE_FONTE = {
  TEX: 500,
  LARGURA: 152,
  ALTURA: 253,
  TOPO: 127,
  frames: {
    idle:  { origem: 'alice-idle-frente',   destino: 'alice/idle', cx: 250.5 },
    right: { origem: 'alice-anda-direita',  destino: 'alice/dir',  cx: 247.0 },
    left:  { origem: 'alice-anda-esquerda', destino: 'alice/esq',  cx: 253.0 },
  },
};

/**
 * Alice andando de COSTAS, para o fundo da cena.
 *
 * Ao contrario dos tres frames de frente/perfil, estes ja vieram como quadros
 * separados e ja foram normalizados para 152x253 (a mesma janela dos outros,
 * com os pes na base). Por isso entram direto, sem recorte em tempo de
 * execucao.
 *
 * O quadro 0 e ela parada; do 1 ao 4 e o ciclo de caminhada.
 */
export const ALICE_COSTAS = {
  parada: 'alice-costas-0',
  ciclo: ['alice-costas-1', 'alice-costas-2', 'alice-costas-3', 'alice-costas-4'],
  /** Tempo de cada quadro do ciclo, em ms. */
  msPorQuadro: 130,
};

/**
 * O recorte da Alice e gravado em tamanho cheio (escala 1). Quem cuida do
 * tamanho em cena e a perspectiva: `escalaPorProfundidade`. Assim ela nunca
 * passa por dois redimensionamentos seguidos e o traco se mantem.
 */
export const ALICE_ESCALA = 1;

/** Tamanho do sprite depois do recorte, em pixels da textura. */
export const ALICE_SPRITE = {
  W: ALICE_FONTE.LARGURA,
  H: ALICE_FONTE.ALTURA,
};

/**
 * Pegada da Alice: a area que os pes ocupam no chao. E com ela que a colisao
 * acontece, nao com o corpo inteiro — num jogo com profundidade quem esbarra
 * na mobilia sao os pes, nao a cabeca.
 */
export const ALICE_PES = { W: 58, H: 26 };

/** Estados de animacao previstos na especificacao (regra 27). */
export const ALICE_STATE = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  RUN: 'RUN',
  JUMP: 'JUMP',
  FALL: 'FALL',
  LAND: 'LAND',
  DAMAGE: 'DAMAGE',
  BREATHLESS: 'BREATHLESS',
};

/** Tempo parada antes de virar de frente para a camera (ms). */
export const IDLE_FRONT_DELAY = 550;

/** Vidas iniciais — o HUD mostra como espadas. */
export const VIDAS_INICIAIS = 3;

/** Invulnerabilidade depois de tomar dano (ms). */
export const IFRAMES = 900;
