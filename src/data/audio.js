/**
 * Catalogo de audio.
 *
 * Os arquivos entregues sao longos e varios sao COMPILACOES. Aqui cada som do
 * jogo vira um CLIPE: um trecho nomeado, com inicio e duracao em segundos.
 *
 * Os cortes foram definidos pela desenvolvedora. Onde ela disse "qualquer
 * parte", os numeros vieram de medicao do proprio arquivo (envelope de energia
 * em janelas de 10 a 60 ms), para o corte nao cair em silencio nem no meio de
 * um ataque. Cada um esta anotado com a origem do numero.
 *
 * categoria: 'musica' | 'ambiente' | 'efeito'
 */

export const AUDIO_ARQUIVOS = {
  'aparicao':         'assets/audio/aparicao.ogg',
  'coelho-morrendo':  'assets/audio/coelho-morrendo.ogg',
  'corrida':          'assets/audio/corrida.ogg',
  'efeitos':          'assets/audio/efeitos.ogg',
  'espelho-rangendo': 'assets/audio/espelho-rangendo.ogg',
  'galhos':           'assets/audio/galhos.ogg',
  'grito':            'assets/audio/grito.ogg',
  'item-coleta':      'assets/audio/item-coleta.ogg',
  'item-drop':        'assets/audio/item-drop.ogg',
  'musica-menu':      'assets/audio/musica-menu.ogg',
  'musica-tensa':     'assets/audio/musica-tensa.ogg',
  'passos-floresta':  'assets/audio/passos-floresta.ogg',
  'passos-xadrez':    'assets/audio/passos-xadrez.ogg',
  'piso-madeira':     'assets/audio/piso-madeira.ogg',
  'porta-abrindo':    'assets/audio/porta-abrindo.ogg',
  'porta-rangido':    'assets/audio/porta-rangido.ogg',
  'queda-floresta':   'assets/audio/queda-floresta.ogg',
  'respiracao':       'assets/audio/respiracao.ogg',
  'respiracao-ofegante': 'assets/audio/respiracao-ofegante.ogg',
  'roupa':            'assets/audio/roupa.ogg',
  'silencio-tenso':   'assets/audio/silencio-tenso.ogg',
  'sussurros':        'assets/audio/sussurros.ogg',
  'tic-tac':          'assets/audio/tic-tac.ogg',
  'trailer':          'assets/audio/trailer.ogg',
  'xadrez':           'assets/audio/xadrez.ogg',
};

/**
 * O que existe dentro de `sons de efeito.ogg` (35,4 s).
 * Oito efeitos separados por silencio. MEDIDO: todos sao CRESCENDOS, nao
 * impactos — o pico chega 1,5 a 2 s depois do ataque. Por isso nenhum deles
 * serve para pulo, aterrissagem ou dano, que precisam de ataque instantaneo.
 *
 *   #  ataque   fim     dur    forca
 *   1   2,44    3,73   1,29    0,38   suave
 *   2   6,42    9,48   3,06    0,53
 *   3  11,42   13,89   2,47    0,83   forte
 *   4  15,55   18,66   3,11    1,00   o mais alto
 *   5  19,92   22,74   2,82    0,59
 *   6  23,64   26,38   2,74    0,45
 *   7  31,08   34,56   3,48    0,58
 *   8  34,50   34,95   0,45    0,40   o unico curto
 */

export const CLIPES = {
  // ---------------------------------------------------------------- musica

  /** Menu: o arquivo inteiro, em loop. */
  'musica.menu': { arquivo: 'musica-menu', categoria: 'musica', loop: true, volume: 0.55 },

  /**
   * O tema da abertura tambem na tela HISTORIA, como ela pediu.
   *
   * Antes eram sete segundos so (o corte 5s-12s) e um `pararMusica` no segundo
   * 6,2. Na pratica isso deixava o jogador lendo o texto inteiro no silencio, e
   * dava a impressao de que a tela estava sem musica. Agora e o tema inteiro,
   * em loop, mais baixo que no menu — presente sem competir com a leitura.
   */
  'musica.historia': {
    arquivo: 'musica-menu', categoria: 'musica', loop: true, volume: 0.42,
  },

  /** Perseguicao da Fase 2. Sem corte definido: toca inteiro, em loop. */
  'musica.tensa': { arquivo: 'musica-tensa', categoria: 'musica', loop: true, volume: 0.6 },

  /** Nao entra no jogo: e o material de divulgacao. */
  'musica.trailer': { arquivo: 'trailer', categoria: 'musica', volume: 0.8 },

  // -------------------------------------------------------------- ambiente

  /** MEDIDO: som continuo por 98% do arquivo; os ultimos 0,9 s tem falhas. */
  'ambiente.silencio': {
    arquivo: 'silencio-tenso', categoria: 'ambiente', inicio: 0, duracao: 19.4,
    loop: true, volume: 0.45,
  },

  'ambiente.sussurros': {
    arquivo: 'sussurros', categoria: 'ambiente', inicio: 1, duracao: 18,
    loop: true, volume: 0.35,
  },

  /** MEDIDO: estalos espalhados de 0,65 s a 10,7 s. Toca inteiro. */
  'ambiente.galhos': { arquivo: 'galhos', categoria: 'ambiente', loop: true, volume: 0.5 },

  /**
   * MEDIDO: as batidas caem em 2,10 · 3,10 · 4,10 · 5,05 · 6,05 · 7,05 ...
   * ou seja, EXATAMENTE 1 segundo entre elas. Um loop de 9 segundos comecando
   * logo antes de uma batida fecha sem emenda — e o tic-tac precisa disso,
   * porque ele toca por minutos seguidos.
   */
  'ambiente.tictac': {
    arquivo: 'tic-tac', categoria: 'ambiente', inicio: 2.05, duracao: 9,
    loop: true, volume: 0.7,
  },

  /**
   * A respiracao da Alice e uma CAMADA, nao um efeito: entra baixinha e fica.
   * A ofegante substitui a normal depois da perseguicao.
   */
  'alice.respiracao': {
    arquivo: 'respiracao', categoria: 'ambiente', loop: true, volume: 0.3,
  },

  'alice.ofegante': {
    arquivo: 'respiracao-ofegante', categoria: 'ambiente', loop: true, volume: 0.45,
  },

  // ---------------------------------------------------------------- passos

  /** MEDIDO: as pisadas comecam em 2,2 s. Antes disso e ambiente. */
  'passos.madeira': {
    arquivo: 'piso-madeira', categoria: 'efeito', inicio: 2.2, duracao: 22,
    loop: true, volume: 0.55,
  },

  /** MEDIDO: a corrida engata em 1,25 s; a partir de 2 s o passo esta firme. */
  'passos.corrida': {
    arquivo: 'corrida', categoria: 'efeito', inicio: 2, duracao: 7,
    loop: true, volume: 0.6,
  },

  /**
   * Os galhos estalando SAO os passos na floresta: ela renomeou o arquivo
   * para deixar isso claro. O mesmo som serve de ambiente e de pisada.
   * MEDIDO: estalos de 0,65 s a 10,7 s.
   */
  'passos.floresta': {
    arquivo: 'passos-floresta', categoria: 'efeito', inicio: 0.6, duracao: 10,
    loop: true, volume: 0.5,
  },

  /**
   * As batidas de peca SAO os passos no tabuleiro — pedra sob o sapato.
   * MEDIDO: batidas secas a cada ~1 s, ataque instantaneo.
   */
  'passos.xadrez': {
    arquivo: 'passos-xadrez', categoria: 'efeito', inicio: 1, duracao: 12,
    loop: true, volume: 0.5,
  },

  // --------------------------------------------------------------- efeitos

  'efeito.porta': {
    arquivo: 'porta-abrindo', categoria: 'efeito', inicio: 0, duracao: 3, volume: 0.8,
  },

  /** Sem corte definido pela desenvolvedora; toca inteiro por enquanto. */
  'efeito.rangido': {
    arquivo: 'porta-rangido', categoria: 'efeito', inicio: 0, duracao: 4, volume: 0.75,
  },

  'efeito.item': {
    arquivo: 'item-coleta', categoria: 'efeito', inicio: 1, duracao: 1, volume: 0.85,
  },

  /** Item sendo solto. Arquivo proprio, entregue depois dos outros. */
  'efeito.item-cai': {
    arquivo: 'item-drop', categoria: 'efeito', inicio: 1, duracao: 1, volume: 0.8,
  },

  /**
   * MEDIDO: o impacto esta em 3,16 s, nao em 2–3 s. Na janela 2–3 o arquivo
   * so tem 17% do nivel — a queda ficaria quase inaudivel. A janela abaixo
   * pega a aproximacao E a batida.
   */
  'efeito.queda': {
    arquivo: 'queda-floresta', categoria: 'efeito', inicio: 2.9, duracao: 1.1, volume: 0.85,
  },

  // ------------------------------------------------ impactos do corpo dela
  //
  // Os tres sons que faltavam saem destes arquivos. MEDIDO por deteccao de
  // transiente (subida de energia em janelas de 10 ms):
  //
  //   corrida.ogg   12 pisadas. A de 2,28 s e a mais forte e limpa (ataque em
  //                 0,09 s, cauda 0,12 s); a de 2,88 s e um arrasto curto
  //                 (cauda 0,07 s).
  //   xadrez.ogg    15 batidas com ataque INSTANTANEO (0 s ate o pico) e cauda
  //                 de 0,01 a 0,08 s. Sao impactos de verdade, secos — o que o
  //                 `sons de efeito` nao tinha.

  /** Arrasto curto do pe empurrando o chao. */
  'efeito.pulo': {
    arquivo: 'corrida', categoria: 'efeito', inicio: 2.86, duracao: 0.22, volume: 0.55,
  },

  /** A pisada mais forte do arquivo: o pe voltando ao chao. */
  'efeito.aterrissagem': {
    arquivo: 'corrida', categoria: 'efeito', inicio: 2.26, duracao: 0.32, volume: 0.7,
  },

  /** Batida seca, sem cauda. E a unica coisa no acervo com ataque imediato. */
  'efeito.dano': {
    arquivo: 'xadrez', categoria: 'efeito', inicio: 3.31, duracao: 0.3, volume: 0.9,
  },

  /** MEDIDO: o golpe ataca em 0,73 s e morre em 1,57 s. */
  'efeito.aparicao': {
    arquivo: 'aparicao', categoria: 'efeito', inicio: 0.7, duracao: 0.95, volume: 0.9,
  },

  /** MEDIDO: o segundo trecho do arquivo, mais longo e mais grave. */
  'efeito.aparicao-longa': {
    arquivo: 'aparicao', categoria: 'efeito', inicio: 8.15, duracao: 2.95, volume: 0.85,
  },

  'efeito.grito': { arquivo: 'grito', categoria: 'efeito', volume: 0.9 },

  /** MEDIDO: rangidos de 0,8 s a 10,2 s; os quatro primeiros sao os melhores. */
  'efeito.espelho': {
    arquivo: 'espelho-rangendo', categoria: 'efeito', inicio: 0.8, duracao: 3.2, volume: 0.85,
  },

  /** MEDIDO: o tecido soa de 0,55 s a 7,05 s. */
  'efeito.roupa': {
    arquivo: 'roupa', categoria: 'efeito', inicio: 0.55, duracao: 3.5, volume: 0.8,
  },

  /** MEDIDO: seis lamentos entre 1,2 s e 6,45 s. */
  'efeito.coelho': {
    arquivo: 'coelho-morrendo', categoria: 'efeito', inicio: 1.2, duracao: 5.3, volume: 0.85,
  },

  'efeito.sussurro': {
    arquivo: 'sussurros', categoria: 'efeito', inicio: 3.25, duracao: 4.2, volume: 0.6,
  },

  /**
   * Bloco 3 do `sons de efeito`: forte, com corpo. E o som de perceber uma
   * coisa — usado quando uma pista entra na conta.
   */
  'efeito.descoberta': {
    arquivo: 'efeitos', categoria: 'efeito', inicio: 11.42, duracao: 2.5, volume: 0.7,
  },

  /** Bloco 4: o mais alto do arquivo. Para o momento em que a coisa vira. */
  'efeito.tensao': {
    arquivo: 'efeitos', categoria: 'efeito', inicio: 15.55, duracao: 3.1, volume: 0.8,
  },

  // ------------------------------------------------------------- xadrez

  /**
   * MEDIDO: `sons de xadrez` tem SEIS batidas isoladas, cada uma com ~0,03 s
   * de ataque. Elas viram cinco variantes (a de 10,38 s ficou de fora por ser
   * fraca demais). Alternar entre elas evita que a formacao da mensagem na
   * Fase 3 soe como um metronomo.
   */
  'efeito.clac1': { arquivo: 'xadrez', categoria: 'efeito', inicio: 2.26, duracao: 0.34, volume: 0.85 },
  'efeito.clac2': { arquivo: 'xadrez', categoria: 'efeito', inicio: 4.24, duracao: 0.34, volume: 0.85 },
  'efeito.clac3': { arquivo: 'xadrez', categoria: 'efeito', inicio: 5.26, duracao: 0.34, volume: 0.8 },
  'efeito.clac4': { arquivo: 'xadrez', categoria: 'efeito', inicio: 11.26, duracao: 0.34, volume: 0.85 },
  'efeito.clac5': { arquivo: 'xadrez', categoria: 'efeito', inicio: 12.29, duracao: 0.34, volume: 0.9 },
};

/** As cinco variantes de CLAC, para sortear sem repetir a anterior. */
export const CLACS = ['efeito.clac1', 'efeito.clac2', 'efeito.clac3', 'efeito.clac4', 'efeito.clac5'];

/**
 * Sons pedidos pela especificacao que NAO existem nos arquivos entregues.
 * O jogo checa esta lista antes de tentar tocar, para nunca soar errado.
 *
 * Os tres primeiros sao impactos e nao dao para tirar do `sons de efeito`:
 * aquele arquivo so tem crescendos, e crescendo no lugar de batida soa errado.
 */
/**
 * Sons pedidos pela especificacao que ainda nao existem.
 * A lista esta VAZIA: os 30 sons da especificacao estao todos no acervo.
 */
export const AUDIO_FALTANDO = {};
