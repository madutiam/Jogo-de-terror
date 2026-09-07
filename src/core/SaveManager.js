/**
 * Configuracoes e progresso, guardados no navegador.
 * Tudo aqui tolera localStorage bloqueado (aba anonima, iOS restrito):
 * se nao der para ler ou gravar, o jogo continua com os valores padrao.
 */

const CHAVE_CONFIG = 'alice-terror:config';
const CHAVE_PROGRESSO = 'alice-terror:progresso';

const CONFIG_PADRAO = {
  /**
   * FOLGA PARA SUBIR.
   *
   * Estava 0,8 / 0,7 / 0,9. Com isso a musica do menu tocava em 0,308 e, com
   * TUDO no maximo, chegava a 0,55 — o teto vem do volume do proprio clipe, que
   * e a mixagem e nao deve mudar. Ou seja: arrastar os tres controles de ponta a
   * ponta rendia 1,8x, que no ouvido e quase nada. Quem punha em 100%% concluia,
   * com razao, que o controle nao fazia efeito.
   *
   * Mais baixo, a mesma viagem rende 2,4x, e sobrar espaco para subir e o que
   * faz um controle de volume parecer um controle de volume.
   */
  volumeGeral: 0.7,
  volumeMusica: 0.6,
  volumeEfeitos: 0.8,

  // ---- controles de toque (celular) ----
  /** Multiplica o tamanho dos botoes: 0.8 pequeno, 1 medio, 1.3 grande. */
  tamanhoControles: 1,
  /** 'analogico' (arrastar) ou 'direcional' (cruz de quatro botoes). */
  tipoControle: 'analogico',
  /** 'destro' = andar na esquerda; 'canhoto' = tudo espelhado. */
  ladoControles: 'destro',
  /** Botao dedicado de correr. Sem ele, correr e empurrar o analogico ate o fim
   *  — o que nao existe na cruz direcional. */
  botaoCorrer: false,
  /** Preenchimento dos botoes: 0.06 discreto, 0.12 medio, 0.24 visivel. */
  opacidadeControles: 0.12,
};

const PROGRESSO_PADRAO = {
  /** Ultima fase alcancada. */
  fase: 1,
  /** Id do checkpoint dentro da fase, ou null para o inicio. */
  checkpoint: null,
  /**
   * Comodos em que ela ja entrou, na ORDEM em que entrou.
   *
   * O mapa se revela a partir daqui: um comodo so aparece depois de pisado. A
   * ordem importa porque e ela que conta o caminho — quem voltou pelo corredor
   * tres vezes nao tem tres corredores, mas quem foi a despensa antes da sala
   * lateral ve o mapa crescer nessa ordem.
   */
  salas: [],

  /** Pistas ja encontradas, por id. As tres fases compartilham esta lista. */
  pistas: [],
  /** Itens no bolso da Alice (relogio, chave, pedaco de roupa...). */
  itens: [],
};

function ler(chave, padrao) {
  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return { ...padrao };
    return { ...padrao, ...JSON.parse(bruto) };
  } catch (erro) {
    console.warn('[save] nao consegui ler "' + chave + '":', erro);
    return { ...padrao };
  }
}

function gravar(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    console.warn('[save] nao consegui gravar "' + chave + '":', erro);
    return false;
  }
}

let config = ler(CHAVE_CONFIG, CONFIG_PADRAO);
let progresso = ler(CHAVE_PROGRESSO, PROGRESSO_PADRAO);

export const SaveManager = {
  // ---- configuracoes ----

  getConfig() {
    return { ...config };
  },

  setConfig(parcial) {
    config = { ...config, ...parcial };
    gravar(CHAVE_CONFIG, config);
    return { ...config };
  },

  // ---- progresso ----

  getProgresso() {
    return { ...progresso, pistas: [...progresso.pistas], itens: [...progresso.itens], salas: [...progresso.salas] };
  },

  /** Salva o ponto atual. So deve ser chamado depois de uma conquista real. */
  salvarCheckpoint(fase, checkpoint) {
    progresso = { ...progresso, fase, checkpoint };
    gravar(CHAVE_PROGRESSO, progresso);
  },

  registrarPista(id) {
    if (progresso.pistas.includes(id)) return false;
    progresso = { ...progresso, pistas: [...progresso.pistas, id] };
    gravar(CHAVE_PROGRESSO, progresso);
    return true;
  },

  temPista(id) {
    return progresso.pistas.includes(id);
  },

  /** Marca um comodo como visitado. Devolve true so na primeira vez. */
  registrarSala(id) {
    if (!id || progresso.salas.includes(id)) return false;
    progresso = { ...progresso, salas: [...progresso.salas, id] };
    gravar(CHAVE_PROGRESSO, progresso);
    return true;
  },

  visitou(id) {
    return progresso.salas.includes(id);
  },

  registrarItem(id) {
    if (progresso.itens.includes(id)) return false;
    progresso = { ...progresso, itens: [...progresso.itens, id] };
    gravar(CHAVE_PROGRESSO, progresso);
    return true;
  },

  temItem(id) {
    return progresso.itens.includes(id);
  },

  /** Existe jogo comecado? Usado pelo menu para decidir entre JOGAR e CONTINUAR. */
  temProgresso() {
    return progresso.fase > 1 || progresso.checkpoint !== null || progresso.itens.length > 0;
  },

  apagarProgresso() {
    progresso = { ...PROGRESSO_PADRAO, pistas: [], itens: [], salas: [] };
    gravar(CHAVE_PROGRESSO, progresso);
  },
};
