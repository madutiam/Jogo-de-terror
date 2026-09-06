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
  /** Uma cena para todas as salas da Fase 1; ver src/data/salas.js. */
  SALA: 'Sala',
  /** As cinematicas. Sao EXATAMENTE cinco no jogo inteiro (roteiro, secao 32). */
  HIGHSFIELD01: 'Highsfield01',
  HIGHSFIELD02: 'Highsfield02',
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
 * OS QUADROS DA ALICE
 *
 * Todos os desenhos dela foram fatiados das folhas originais e gravados numa
 * TELA COMUM: mesmo tamanho de imagem, pes na base, corpo ancorado no centro do
 * vestido. Trocar de quadro nao faz ela pular nem tremer.
 *
 * As folhas vieram em escalas diferentes umas das outras — e algumas linhas
 * dentro da MESMA folha tambem. Cada linha foi reescalada no fatiamento para a
 * Alice em pe medir sempre ALICE_ALTURA. Ver tools/fatiar-alice.ps1.
 *
 * Aqui so mora a contagem: quantos quadros cada linha tem. A textura de cada
 * quadro se chama `alice/<linha>-<indice>`.
 */
export const ALICE_QUADROS = {
  // Atlas de perfil — o unico conjunto com desenho proprio para cada lado.
  'anda-dir': 11, 'anda-esq': 11,
  'pula-dir': 5,  'pula-esq': 5,
  'cai-dir': 6,   'cai-esq': 6,
  'pega-dir': 6,  'pega-esq': 6,

  // Folha dos biscoitos: a Alice normal e a pequena, desenhadas juntas.
  'grande-parada': 4, 'grande-anda': 6, 'grande-pula': 6,
  'grande-cai': 5,    'grande-pega': 5,
  'pequena-parada': 4, 'pequena-anda': 7, 'pequena-pula': 6,
  'pequena-cai': 5,    'pequena-pega': 5,

  // AS FOLHAS NOVAS DA PEQUENA — com os DOIS lados desenhados.
  //
  // Ate aqui a pequena existia so olhando para a direita e o jogo espelhava
  // para a esquerda. Agora ha desenho proprio de cada lado, e a regra do
  // projeto e clara: onde existe o desenho certo, espelhar sai.
  'pequena-anda-dir': 6, 'pequena-anda-esq': 6,
  'pequena-pula-dir': 4, 'pequena-pula-esq': 4,
  'pequena-cai-dir': 5,  'pequena-cai-esq': 5,
  'pequena-pega-dir': 4, 'pequena-pega-esq': 4,
  'pequena-costas': 5,   'pequena-anda-frente': 7,

  // E o que faltava por ultimo: correr, apanhar, recuperar o folego, e comer o
  // biscoito no tamanho pequeno. `AliceAssetsFaltando` da pequena esvaziou.
  'pequena-corre-dir': 6, 'pequena-corre-esq': 6,
  'pequena-dano-dir': 4,  'pequena-dano-esq': 4,
  'pequena-ofegante': 4,
  'pequena-come-shrink': 8, 'pequena-come-grow': 8,
  'transicao': 8,

  // Corrida de perfil e caminhada vindo para a camera.
  'corre-dir': 6, 'corre-esq': 6, 'anda-frente': 6,

  // De costas.
  'costas': 5, 'costas-pulo': 5, 'costas-corre': 6, 'costas-pega-item': 4,

  // Reacoes.
  'ofegante': 4, 'dano-dir': 2, 'dano-esq': 2,

  // Comendo o biscoito. Duas sequencias completas, uma por vidro: ela tira o
  // biscoito, come e mastiga. O que vem DEPOIS e a `transicao`, que e o corpo
  // mudando — sao dois gestos, nao um.
  'come-shrink': 8, 'come-grow': 8,
};

/** Tela comum de todos os quadros, em pixels. */
export const ALICE_SPRITE = { W: 260, H: 296 };
/** Altura da Alice EM PE dentro dessa tela. E a medida que normaliza tudo. */
export const ALICE_ALTURA = 253;

/**
 * O desenho ja sai do fatiamento no tamanho final. Quem cuida do tamanho em
 * cena e a perspectiva (`escalaPorProfundidade`) — assim ela nunca passa por
 * dois redimensionamentos seguidos e o traco se mantem.
 */
export const ALICE_ESCALA = 1;

/**
 * Pegada da Alice: a area que os pes ocupam no chao. E com ela que a colisao
 * acontece, nao com o corpo inteiro — num jogo com profundidade quem esbarra
 * na mobilia sao os pes, nao a cabeca.
 */
export const ALICE_PES = { W: 58, H: 26 };

/**
 * OS DOIS TAMANHOS (roteiro, secao 7)
 *
 * A folha grande/pequena ja foi desenhada com a proporcao certa: medida na
 * imagem fatiada, a pequena tem 131 px contra 253 da normal — 52%. Nada aqui
 * reescala desenho nenhum; cada tamanho usa os QUADROS DELE.
 *
 * O que muda alem do desenho:
 *   pes      — a colisao encolhe junto, senao ela continuaria esbarrando no que
 *              deveria caber por baixo
 *   impulso  — pequena pula MAIS BAIXO. E o que faz a escada quebrada ser um
 *              obstaculo de verdade e obriga a voltar ao tamanho normal
 *   passo    — perna curta anda menos
 */
export const ALICE_TAMANHO = {
  normal: {
    id: 'normal',
    pes: { W: 58, H: 26 },
    // Altura de pulo: 100%. Alcanca a comoda (topo 120) e o bau (52).
    impulso: 1,
    passo: 1,
  },
  pequena: {
    id: 'pequena',
    pes: { W: 30, H: 14 },
    // 0,74 de impulso = 55% da altura, porque a altura cresce com o QUADRADO
    // do impulso. Com isso ela alcanca o bau e NAO alcanca a comoda.
    impulso: 0.74,
    passo: 0.78,
  },
};

/** Duracao da animacao de encolher (e de crescer), em ms. */
export const ALICE_TRANSICAO_MS = 720;

/**
 * Quanto dura o gesto de comer, antes de o corpo comecar a mudar.
 *
 * 8 quadros. Nao e so animacao: e a pausa que faz o biscoito virar objeto em
 * vez de botao. Curto demais e a troca continua parecendo um atalho de teclado.
 */
export const ALICE_COMER_MS = 980;

/**
 * QUAL LINHA DE QUADROS USAR EM CADA SITUACAO
 *
 * `espelhar: true` desenha o quadro virado. Isso so aparece onde a artista NAO
 * desenhou o outro lado — a Alice pequena, por exemplo, so existe olhando para
 * a direita. Onde existe desenho proprio para cada lado (o atlas de perfil),
 * espelhamento nao e usado: o desenho certo e sempre preferido.
 *
 * `porAltura: true` escolhe o quadro pela altura do pulo, e nao pelo relogio —
 * subindo mostra os primeiros, caindo mostra os ultimos.
 *
 * `falta` e o pedido registrado em MissingAssets quando caimos num substituto.
 */
export const ALICE_ANIM = {
  normal: {
    paradaFrente: { linha: 'grande-parada', ms: 520 },
    paradaCostas: { linha: 'costas', quadros: [0] },

    andaDir:    { linha: 'anda-dir',    ms: 85 },
    andaEsq:    { linha: 'anda-esq',    ms: 85 },
    andaFrente: { linha: 'anda-frente', ms: 115 },
    andaCostas: { linha: 'costas',      quadros: [1, 2, 3, 4], ms: 130 },

    correDir:    { linha: 'corre-dir',    ms: 72 },
    correEsq:    { linha: 'corre-esq',    ms: 72 },
    correCostas: { linha: 'costas-corre', ms: 72 },
    correFrente: { linha: 'anda-frente',  ms: 80,
                   falta: 'CORRENDO de frente, vindo para a camera' },

    pulaDir:    { linha: 'pula-dir',    porAltura: true },
    pulaEsq:    { linha: 'pula-esq',    porAltura: true },
    pulaCostas: { linha: 'costas-pulo', porAltura: true },
    pulaFrente: { linha: 'grande-pula', porAltura: true },

    pegaDir:    { linha: 'pega-dir',         ms: 110, umaVez: true },
    pegaEsq:    { linha: 'pega-esq',         ms: 110, umaVez: true },
    pegaCostas: { linha: 'costas-pega-item', ms: 130, umaVez: true },

    danoDir: { linha: 'dano-dir', ms: 140, umaVez: true },
    danoEsq: { linha: 'dano-esq', ms: 140, umaVez: true },

    tomboDir: { linha: 'cai-dir', ms: 130, umaVez: true },
    tomboEsq: { linha: 'cai-esq', ms: 130, umaVez: true },

    ofegante: { linha: 'ofegante', ms: 260 },

    /**
     * Comer. Vem ANTES da transicao, e cada vidro tem a sua: no SHRINK ela
     * encolhe os ombros ao engolir, no GROW ela se estica. Desenhos
     * diferentes, nao o mesmo espelhado.
     */
    comeShrink: { linha: 'come-shrink', ms: 120 },
    comeGrow:   { linha: 'come-grow',   ms: 120 },
  },

  pequena: {
    // Os dois lados sao DESENHADOS. Nada de espelhar aqui: onde existe o
    // desenho certo, ele e sempre preferido — e agora ele existe para tudo.
    paradaFrente: { linha: 'pequena-parada', ms: 520 },
    paradaCostas: { linha: 'pequena-costas', quadros: [0] },

    andaDir:    { linha: 'pequena-anda-dir', ms: 85 },
    andaEsq:    { linha: 'pequena-anda-esq', ms: 85 },
    andaFrente: { linha: 'pequena-anda-frente', ms: 95 },
    andaCostas: { linha: 'pequena-costas', quadros: [1, 2, 3, 4], ms: 130 },

    correDir:    { linha: 'pequena-corre-dir', ms: 72 },
    correEsq:    { linha: 'pequena-corre-esq', ms: 72 },
    correFrente: { linha: 'pequena-anda-frente', ms: 62 },
    correCostas: { linha: 'pequena-costas', quadros: [1, 2, 3, 4], ms: 90 },

    pulaDir:    { linha: 'pequena-pula-dir', porAltura: true },
    pulaEsq:    { linha: 'pequena-pula-esq', porAltura: true },
    pulaFrente: { linha: 'pequena-pula-dir', porAltura: true },
    pulaCostas: { linha: 'pequena-pula-dir', porAltura: true,
                  falta: 'Alice PEQUENA pulando de costas' },

    pegaDir:    { linha: 'pequena-pega-dir', ms: 110, umaVez: true },
    pegaEsq:    { linha: 'pequena-pega-esq', ms: 110, umaVez: true },
    pegaCostas: { linha: 'pequena-pega-dir', ms: 110, umaVez: true,
                  falta: 'Alice PEQUENA pegando item de costas' },

    danoDir: { linha: 'pequena-dano-dir', ms: 140, umaVez: true },
    danoEsq: { linha: 'pequena-dano-esq', ms: 140, umaVez: true },

    tomboDir: { linha: 'pequena-cai-dir', ms: 130, umaVez: true },
    tomboEsq: { linha: 'pequena-cai-esq', ms: 130, umaVez: true },

    ofegante: { linha: 'pequena-ofegante', ms: 300 },

    // Comer no tamanho pequeno. So o GROW acontece de verdade — quem ja esta
    // pequena nao encolhe de novo — mas os dois existem desenhados.
    comeShrink: { linha: 'pequena-come-shrink', ms: 120 },
    comeGrow:   { linha: 'pequena-come-grow', ms: 120 },
  },

  /** Encolher. Para crescer, a mesma sequencia toca de tras para a frente. */
  transicao: { linha: 'transicao', ms: 90 },

};

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
  /** Encolhendo ou crescendo: sem controle enquanto dura. */
  TAMANHO: 'TAMANHO',
};

/** Tempo parada antes de virar de frente para a camera (ms). */
export const IDLE_FRONT_DELAY = 550;

/** Vidas iniciais — o HUD mostra como espadas. */
export const VIDAS_INICIAIS = 3;

/** Invulnerabilidade depois de tomar dano (ms). */
export const IFRAMES = 900;
